package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.consultant.ConsultantDto;
import next.gen.consulting.dto.consultant.CreateConsultantDto;
import next.gen.consulting.dto.consultant.UpdateConsultantDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.consultant.ConsultantMapper;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.User;
import next.gen.consulting.model.UserRole;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.RequestRepository;
import next.gen.consulting.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultantService {

    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;
    private final ConsultantMapper consultantMapper;

    public ConsultantDto getById(UUID id) {
        Consultant consultant = findById(id);
        return consultantMapper.toDto(consultant);
    }

    public ConsultantDto getByUserId(UUID userId) {
        Consultant consultant = consultantRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant", "userId", userId));
        return consultantMapper.toDto(consultant);
    }

    public List<ConsultantDto> search(String userName) {
        String query = userName == null ? "" : userName.trim();

        List<Consultant> consultants = query.isEmpty()
                ? consultantRepository.findByUserRole(UserRole.CONSULTANT)
                : consultantRepository.findByUserFullNameContainingIgnoreCase(query).stream()
                        .filter(c -> UserRole.CONSULTANT.equals(c.getUser().getRole()))
                        .toList();

        return consultants.stream()
                .map(consultantMapper::toDto)
                .toList();
    }

    public Page<ConsultantDto> getAll(Pageable pageable) {
        return consultantRepository.findByUserRole(UserRole.CONSULTANT, pageable)
                .map(consultantMapper::toDto);
    }

    @Transactional
    public ConsultantDto create(CreateConsultantDto consultantDto) {
        User user = userRepository.findById(consultantDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", consultantDto.getUserId()));

        if (consultantRepository.findByUserId(user.getId()).isPresent()) {
            throw new BadRequestException("Consultant profile already exists for this user");
        }

        if (!UserRole.CONSULTANT.equals(user.getRole())) {
            user.setRole(UserRole.CONSULTANT);
            userRepository.save(user);
        }

        Consultant consultant = Consultant.builder()
                .user(user)
                .specialization(consultantDto.getSpecialization())
                .experience(consultantDto.getExperience())
                .build();

        return consultantMapper.toDto(consultantRepository.save(consultant));
    }

    @Transactional
    public ConsultantDto createEmpty(User user) {
        if (consultantRepository.findByUserId(user.getId()).isPresent()) {
            return consultantMapper.toDto(consultantRepository.findByUserId(user.getId()).get());
        }
        Consultant consultant = Consultant.builder()
                .user(user)
                .specialization("")
                .experience("")
                .build();
        return consultantMapper.toDto(consultantRepository.save(consultant));
    }

    // Update by userId when a consultant edits their own profile
    @Transactional
    public ConsultantDto updateByUserId(UUID userId, UpdateConsultantDto consultantDto) {
        Consultant consultant = consultantRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant", "userId", userId));
        return applyUpdate(consultant, consultantDto);
    }

    @Transactional
    public ConsultantDto update(UUID id, UpdateConsultantDto consultantDto) {
        Consultant consultant = findById(id);
        return applyUpdate(consultant, consultantDto);
    }

    private ConsultantDto applyUpdate(Consultant consultant, UpdateConsultantDto consultantDto) {
        if (consultantDto.getSpecialization() != null) {
            consultant.setSpecialization(consultantDto.getSpecialization());
        }
        if (consultantDto.getExperience() != null) {
            consultant.setExperience(consultantDto.getExperience());
        }
        return consultantMapper.toDto(consultantRepository.save(consultant));
    }

    @Transactional
    public void delete(UUID id) {
        Consultant consultant = findById(id);
        List<RequestStatus> activeStatuses = List.of(RequestStatus.PENDING, RequestStatus.PROGRESS);

        if (requestRepository.existsByConsultantIdAndStatusIn(consultant.getId(), activeStatuses)) {
            throw new BadRequestException(
                "Cannot delete consultant with active requests. Reassign or close them first.");
        }

        // Unassign from terminal requests to avoid FK violation
        requestRepository.findByConsultantId(consultant.getId())
                .forEach(r -> r.setConsultant(null));

        User user = consultant.getUser();
        consultantRepository.delete(consultant);
        if (UserRole.CONSULTANT.equals(user.getRole())) {
            user.setRole(UserRole.CLIENT);
            userRepository.save(user);
        }
    }

    private Consultant findById(UUID id) {
        return consultantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant", "id", id));
    }
}
