package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.CreateRequestDto;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.dto.request.UpdateRequestDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.request.RequestMapper;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.Request;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.model.User;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.RequestRepository;
import next.gen.consulting.repository.UserRepository;
import next.gen.consulting.service.request.RequestActionChain;
import next.gen.consulting.service.request.RequestActionContext;
import next.gen.consulting.service.request.RequestActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ConsultantRepository consultantRepository;
    private final RequestMapper requestMapper;
    private final RequestActionChain requestActionChain;

    public RequestDto getById(UUID id) {
        Request request = findById(id);
        return requestMapper.toDto(request);
    }

    public Page<RequestDto> getAll(Pageable pageable, RequestStatus status) {
        return requestRepository.findByStatusNull(status, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getByClientId(UUID clientId, Pageable pageable, RequestStatus status) {
        return requestRepository.findByClientIdAndStatusNullable(clientId, status, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getConsultantRequests(UUID userId, Pageable pageable) {
        return requestRepository.findByConsultantUserId(userId, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable)
                .map(requestMapper::toDto);
    }

    @Transactional
    public RequestDto create(CreateRequestDto requestDto, UUID id) {
        User client = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Consultant consultant = null;
        if (requestDto.getConsultantId() != null) {
            consultant = consultantRepository.findById(requestDto.getConsultantId())
                    .orElse(null);
        }

        Request request = Request.builder()
                .fullName(requestDto.getFullName())
                .phone(requestDto.getPhone())
                .product(requestDto.getProduct())
                .description(requestDto.getDescription())
                .client(client)
                .consultant(consultant)
                .status(RequestStatus.PENDING)
                .build();

        Request savedRequest = requestRepository.save(request);
        RequestDto dto = requestMapper.toDto(savedRequest);

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.CREATED)
                .request(dto)
                .actorId(id)
                .build());

        return dto;
    }

    @Transactional
    public RequestDto update(UUID id, UpdateRequestDto requestDto) {
        Request request = findById(id);
        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.REJECTED) {
            throw new BadRequestException("Cannot modify a " + request.getStatus().name().toLowerCase() + " request");
        }

        if (requestDto.getFullName() != null) {
            request.setFullName(requestDto.getFullName());
        }
        if (requestDto.getPhone() != null) {
            request.setPhone(requestDto.getPhone());
        }
        if (requestDto.getDescription() != null) {
            request.setDescription(requestDto.getDescription());
        }
        if (requestDto.getProduct() != null) {
            request.setProduct(requestDto.getProduct());
        }
        boolean consultantChanged = false;
        UUID assignedConsultantUserId = null;

        if (Boolean.TRUE.equals(requestDto.getRemoveConsultant())) {
            request.setConsultant(null);
            consultantChanged = true;
        } else if (requestDto.getConsultantId() != null) {
            Consultant consultant = consultantRepository.findById(requestDto.getConsultantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "id", requestDto.getConsultantId()));
            boolean alreadyAssigned = request.getConsultant() != null
                    && request.getConsultant().getId().equals(consultant.getId());
            if (!alreadyAssigned) {
                request.setConsultant(consultant);
                consultantChanged = true;
                assignedConsultantUserId = consultant.getUser().getId();
            }
        }

        Request updatedRequest = requestRepository.save(request);
        RequestDto dto = requestMapper.toDto(updatedRequest);

        if (consultantChanged && assignedConsultantUserId != null) {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.CONSULTANT_ASSIGNED)
                    .request(dto)
                    .actorId(assignedConsultantUserId)
                    .build());
        } else {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.UPDATED)
                    .request(dto)
                    .build());
        }

        return dto;
    }

    public Page<RequestDto> getMyRequests(UUID id, Pageable pageable, RequestStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return getByClientId(user.getId(), pageable, status);
    }

    @Transactional
    public RequestDto updateStatus(UUID id, RequestStatus status, UUID actorId, boolean isAdmin, String comment) {
        Request request = findById(id);
        RequestStatus previousStatus = request.getStatus();

        if (previousStatus == RequestStatus.COMPLETED || previousStatus == RequestStatus.REJECTED) {
            throw new BadRequestException(
                    "Cannot change status of a " + previousStatus.name().toLowerCase() + " request");
        }

        if (!isAdmin) {
            Consultant consultant = consultantRepository.findByUserId(actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "userId", actorId));
            if (request.getConsultant() != null && !request.getConsultant().getId().equals(consultant.getId())) {
                throw new BadRequestException("You are not assigned to this request");
            }
            request.setConsultant(consultant);
        }

        request.setStatus(status);

        if (comment != null) {
            request.setComment(comment);
        }

        Request updatedRequest = requestRepository.save(request);
        RequestDto dto = requestMapper.toDto(updatedRequest);

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.STATUS_CHANGED)
                .request(dto)
                .previousStatus(previousStatus)
                .actorId(actorId)
                .build());

        return dto;
    }

    @Transactional
    public void delete(UUID id) {
        Request request = findById(id);
        RequestDto dto = requestMapper.toDto(request);
        requestRepository.delete(request);

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.DELETED)
                .request(dto)
                .build());
    }

    private Request findById(UUID id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));
    }
}
