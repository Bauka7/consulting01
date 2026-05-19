package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.CreateRequestDto;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.dto.request.UpdateRequestDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.request.RequestMapper;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.Factory;
import next.gen.consulting.model.Request;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.model.User;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.FactoryRepository;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ConsultantRepository consultantRepository;
    private final FactoryRepository factoryRepository;
    private final RequestMapper requestMapper;
    private final RequestActionChain requestActionChain;

    public RequestDto getById(UUID id) {
        return requestMapper.toDto(findById(id));
    }

    public Page<RequestDto> getAll(Pageable pageable, RequestStatus status) {
        return requestRepository.findByStatusNull(status, pageable).map(requestMapper::toDto);
    }

    public Page<RequestDto> getByClientId(UUID clientId, Pageable pageable, RequestStatus status) {
        return requestRepository.findByClientIdAndStatusNullable(clientId, status, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getConsultantRequests(UUID userId, Pageable pageable) {
        return requestRepository.findByConsultantUserId(userId, pageable).map(requestMapper::toDto);
    }

    public Page<RequestDto> getByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable).map(requestMapper::toDto);
    }

    @Transactional
    public RequestDto create(CreateRequestDto dto, UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId));

        Consultant consultant = null;
        if (dto.getConsultantId() != null) {
            consultant = consultantRepository.findById(dto.getConsultantId()).orElse(null);
        }

        Factory factory = null;
        if (dto.getFactoryId() != null) {
            factory = factoryRepository.findById(dto.getFactoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", dto.getFactoryId()));
        }

        Request request = Request.builder()
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .product(dto.getProduct())
                .description(dto.getDescription())
                .client(client)
                .consultant(consultant)
                .factory(factory)
                .status(RequestStatus.PENDING)
                .build();

        Request saved = requestRepository.save(request);
        RequestDto result = requestMapper.toDto(saved);

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.CREATED)
                .request(result)
                .actorId(clientId)
                .build());

        return result;
    }

    @Transactional
    public RequestDto update(UUID id, UpdateRequestDto dto, UUID actorId, boolean isAdmin) {
        Request request = findById(id);

        if (!isAdmin && !request.getClient().getId().equals(actorId)) {
            throw new BadRequestException("You can only modify your own requests");
        }
        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.REJECTED) {
            throw new BadRequestException("Cannot modify a " + request.getStatus().name().toLowerCase() + " request");
        }

        if (dto.getFullName() != null)    request.setFullName(dto.getFullName());
        if (dto.getPhone() != null)        request.setPhone(dto.getPhone());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getProduct() != null)      request.setProduct(dto.getProduct());

        boolean consultantChanged = false;
        UUID assignedConsultantUserId = null;

        if (Boolean.TRUE.equals(dto.getRemoveConsultant())) {
            request.setConsultant(null);
            consultantChanged = true;
        } else if (dto.getConsultantId() != null) {
            Consultant consultant = consultantRepository.findById(dto.getConsultantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "id", dto.getConsultantId()));
            if (consultant.getUser().getId().equals(request.getClient().getId())) {
                throw new BadRequestException("A consultant cannot be assigned to their own request");
            }
            boolean alreadyAssigned = request.getConsultant() != null
                    && request.getConsultant().getId().equals(consultant.getId());
            if (!alreadyAssigned) {
                request.setConsultant(consultant);
                consultantChanged = true;
                assignedConsultantUserId = consultant.getUser().getId();
            }
        }

        if (Boolean.TRUE.equals(dto.getRemoveFactory())) {
            request.setFactory(null);
        } else if (dto.getFactoryId() != null) {
            Factory factory = factoryRepository.findById(dto.getFactoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", dto.getFactoryId()));
            request.setFactory(factory);
        }

        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        if (consultantChanged && assignedConsultantUserId != null) {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.CONSULTANT_ASSIGNED)
                    .request(result)
                    .actorId(assignedConsultantUserId)
                    .build());
        } else {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.UPDATED)
                    .request(result)
                    .build());
        }

        return result;
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

        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.STATUS_CHANGED)
                .request(result)
                .previousStatus(previousStatus)
                .actorId(actorId)
                .build());

        return result;
    }

    @Transactional
    public void delete(UUID id, UUID actorId, boolean isAdmin) {
        Request request = findById(id);
        if (!isAdmin && !request.getClient().getId().equals(actorId)) {
            throw new BadRequestException("You can only delete your own requests");
        }
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
