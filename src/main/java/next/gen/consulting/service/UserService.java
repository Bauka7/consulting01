package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.auth.RegisterRequest;
import next.gen.consulting.dto.user.UserDto;
import next.gen.consulting.dto.user.UserUpdateRequest;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.user.UserMapper;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.model.User;
import next.gen.consulting.model.UserRole;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.RequestRepository;
import next.gen.consulting.repository.UserRepository;
import next.gen.consulting.util.PhoneNormalizer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final ConsultantRepository consultantRepository;
    private final RequestRepository requestRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserDto getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    public UserDto getByEmail(String email) {
        User user = findByEmail(email);
        return userMapper.toDto(user);
    }

    public UserDto getByPhone(String phone) {
        String normalized = PhoneNormalizer.normalizeForStorage(phone);
        var candidates = PhoneNormalizer.buildLookupCandidates(phone);
        User user = userRepository.findFirstByPhoneIn(candidates)
                .orElseThrow(() -> new ResourceNotFoundException("User", "phone", normalized));
        return userMapper.toDto(user);
    }

    public Page<UserDto> getAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDto);
    }

    @Transactional
    public UserDto create(RegisterRequest registerRequest) {
        String phone = PhoneNormalizer.normalizeForStorage(registerRequest.getPhone());
        validateUniquePhone(phone);

        UserRole role = (registerRequest.getRole() == UserRole.CLIENT || registerRequest.getRole() == UserRole.CONSULTANT)
                ? registerRequest.getRole()
                : UserRole.CLIENT;

        User user = User.builder()
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phone(phone)
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        if (UserRole.CONSULTANT.equals(role)) {
            consultantRepository.findByUserId(savedUser.getId()).ifPresentOrElse(
                    c -> {},
                    () -> consultantRepository.save(
                            Consultant.builder().user(savedUser).specialization("").experience("").build()
                    )
            );
        }

        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserDto update(UUID id, UserUpdateRequest updateRequest) {
        User user = findById(id);

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            validateUniqueEmail(updateRequest.getEmail());
            user.setEmail(updateRequest.getEmail());
        }

        if (updateRequest.getPhone() != null) {
            String normalizedPhone = PhoneNormalizer.normalizeForStorage(updateRequest.getPhone());
            if (!normalizedPhone.equals(user.getPhone())) {
                validateUniquePhone(normalizedPhone);
                user.setPhone(normalizedPhone);
            }
        }

        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }

        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public UserDto updateRole(UUID id, UserRole role) {
        User user = findById(id);
        UserRole previousRole = user.getRole();

        List<RequestStatus> activeStatuses = List.of(RequestStatus.PENDING, RequestStatus.PROGRESS);

        if (UserRole.CONSULTANT.equals(role) && !UserRole.CONSULTANT.equals(previousRole)) {
            if (requestRepository.existsByClientIdAndStatusIn(id, activeStatuses)) {
                throw new BadRequestException(
                    "Cannot assign Consultant role: user has active requests as a client. Close or complete them first.");
            }
        }

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        if (UserRole.CONSULTANT.equals(role)) {
            consultantRepository.findByUserId(updatedUser.getId()).ifPresentOrElse(
                    c -> {},
                    () -> consultantRepository.save(
                            Consultant.builder().user(updatedUser).specialization("").experience("").build()
                    )
            );
        } else if (UserRole.CONSULTANT.equals(previousRole)) {
            consultantRepository.findByUserId(updatedUser.getId()).ifPresent(consultant -> {
                // Unassign from active requests before removing profile
                requestRepository.findByConsultantIdAndStatusIn(consultant.getId(), activeStatuses)
                        .forEach(r -> r.setConsultant(null));
                consultantRepository.delete(consultant);
            });
        }

        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public void delete(UUID id) {
        findById(id);
        userRepository.deleteByIdNative(id);
    }

    public User findEntityById(UUID id) {
        return findById(id);
    }

    public User findEntityByEmail(String email) {
        return findByEmail(email);
    }

    private User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already in use");
        }
    }

    private void validateUniquePhone(String phone) {
        var candidates = PhoneNormalizer.buildLookupCandidates(phone);
        if (!candidates.isEmpty() && userRepository.existsByPhoneIn(candidates)) {
            throw new BadRequestException("Phone number is already in use");
        }
    }
}
