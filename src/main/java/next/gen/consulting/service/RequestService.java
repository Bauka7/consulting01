package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.*;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.request.RequestMapper;
import next.gen.consulting.model.*;
import next.gen.consulting.repository.*;
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

    private final RequestRepository  requestRepository;
    private final UserRepository     userRepository;
    private final ConsultantRepository consultantRepository;
    private final FactoryRepository  factoryRepository;
    private final RequestMapper      requestMapper;
    private final RequestActionChain requestActionChain;

    // ─────────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────────

    public RequestDto getById(UUID id) {
        return requestMapper.toDto(findById(id));
    }

    public Page<RequestDto> getAll(Pageable pageable, RequestStatus status) {
        return requestRepository.findByStatusNull(status, pageable).map(requestMapper::toDto);
    }

    public Page<RequestDto> getMyRequests(UUID userId, Pageable pageable, RequestStatus status) {
        return requestRepository.findByClientIdAndStatusNullable(userId, status, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getConsultantRequests(UUID userId, Pageable pageable) {
        return requestRepository.findByConsultantUserId(userId, pageable).map(requestMapper::toDto);
    }

    // ─────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto create(CreateRequestDto dto, UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId));

        Consultant consultant = null;
        if (dto.getConsultantId() != null) {
            consultant = consultantRepository.findById(dto.getConsultantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "id", dto.getConsultantId()));
            if (consultant.getUser().getId().equals(clientId)) {
                throw new BadRequestException("You cannot assign yourself as a consultant");
            }
        }

        Factory factory = null;
        if (dto.getFactoryId() != null) {
            factory = factoryRepository.findById(dto.getFactoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", dto.getFactoryId()));
        }

        Request request = Request.builder()
                .fullName(dto.getFullName().trim())
                .phone(dto.getPhone().trim())
                .product(dto.getProduct().trim())
                .description(dto.getDescription().trim())
                .client(client)
                .consultant(consultant)
                .factory(factory)
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .deadline(dto.getDeadline())
                .status(RequestStatus.PENDING)
                .build();

        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.CREATED)
                .request(result)
                .actorId(clientId)
                .build());

        // If factory was immediately set, notify factory user
        if (factory != null && factory.getUser() != null) {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.FACTORY_ASSIGNED)
                    .request(result)
                    .targetUserId(factory.getUser().getId())
                    .actorName(factory.getName())
                    .build());
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // UPDATE (CLIENT / ADMIN — edits basic fields + reassigns)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto update(UUID id, UpdateRequestDto dto, UUID actorId, boolean isAdmin) {
        Request request = findById(id);

        if (!isAdmin && !request.getClient().getId().equals(actorId)) {
            throw new BadRequestException("You can only modify your own requests");
        }
        if (isTerminal(request.getStatus())) {
            throw new BadRequestException("Cannot modify a " + request.getStatus().name().toLowerCase() + " request");
        }

        if (dto.getFullName()    != null) request.setFullName(dto.getFullName().trim());
        if (dto.getPhone()       != null) request.setPhone(dto.getPhone().trim());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription().trim());
        if (dto.getProduct()     != null) request.setProduct(dto.getProduct().trim());
        if (dto.getQuantity()    != null) request.setQuantity(dto.getQuantity());
        if (dto.getUnit()        != null) request.setUnit(dto.getUnit());
        if (dto.getDeadline()    != null) request.setDeadline(dto.getDeadline());

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

        Factory previousFactory = request.getFactory();
        boolean factoryChanged = false;
        Factory newFactory = null;

        if (Boolean.TRUE.equals(dto.getRemoveFactory())) {
            request.setFactory(null);
            factoryChanged = true;
        } else if (dto.getFactoryId() != null) {
            Factory factory = factoryRepository.findById(dto.getFactoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", dto.getFactoryId()));
            if (previousFactory == null || !previousFactory.getId().equals(factory.getId())) {
                request.setFactory(factory);
                factoryChanged = true;
                newFactory = factory;
            }
        }

        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        // Fire appropriate action chain events
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
                    .actorId(actorId)
                    .build());
        }

        if (factoryChanged && newFactory != null && newFactory.getUser() != null) {
            requestActionChain.process(RequestActionContext.builder()
                    .actionType(RequestActionType.FACTORY_ASSIGNED)
                    .request(result)
                    .targetUserId(newFactory.getUser().getId())
                    .actorName(newFactory.getName())
                    .build());
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // STATUS CHANGE (CONSULTANT / ADMIN)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto updateStatus(UUID id, RequestStatus newStatus, UUID actorId, boolean isAdmin, String comment) {
        Request request = findById(id);
        RequestStatus previousStatus = request.getStatus();

        if (isTerminal(previousStatus)) {
            throw new BadRequestException(
                    "Cannot change status of a " + previousStatus.name().toLowerCase() + " request");
        }

        if (!isAdmin) {
            Consultant consultant = consultantRepository.findByUserId(actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "userId", actorId));
            if (request.getConsultant() != null && !request.getConsultant().getId().equals(consultant.getId())) {
                throw new BadRequestException("You are not the assigned consultant for this request");
            }
            // Auto-assign consultant when they first change status
            if (request.getConsultant() == null) {
                request.setConsultant(consultant);
            }
        }

        request.setStatus(newStatus);
        if (comment != null && !comment.isBlank()) {
            request.setComment(comment.trim());
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

    // ─────────────────────────────────────────────────────────────────
    // ASSIGN FACTORY (CONSULTANT for their own factory / ADMIN)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto assignFactory(UUID requestId, UUID factoryId, UUID actorId, boolean isAdmin) {
        Request request = findById(requestId);

        if (isTerminal(request.getStatus())) {
            throw new BadRequestException("Cannot modify a completed/rejected request");
        }

        Factory factory = factoryRepository.findById(factoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", factoryId));

        if (!isAdmin) {
            // Only the assigned consultant may link a factory — and it must be their factory
            Consultant consultant = consultantRepository.findByUserId(actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Consultant", "userId", actorId));

            if (request.getConsultant() == null || !request.getConsultant().getId().equals(consultant.getId())) {
                throw new BadRequestException("Only the assigned consultant can link a factory to this request");
            }
            if (consultant.getFactory() == null || !consultant.getFactory().getId().equals(factory.getId())) {
                throw new BadRequestException("You can only assign the factory you are affiliated with");
            }
        }

        request.setFactory(factory);
        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.FACTORY_ASSIGNED)
                .request(result)
                .actorId(actorId)
                .targetUserId(factory.getUser() != null ? factory.getUser().getId() : null)
                .actorName(factory.getName())
                .build());

        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // UPDATE TRACKING (CONSULTANT assigned to request / FACTORY assigned / ADMIN)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto updateTracking(UUID requestId, UpdateTrackingDto dto, UUID actorId, boolean isAdmin) {
        Request request = findById(requestId);

        if (!isAdmin) {
            verifyConsultantOrFactory(request, actorId);
        }

        if (dto.getTrackingNumber() != null) request.setTrackingNumber(dto.getTrackingNumber().trim());
        if (dto.getTrackingUrl()    != null) request.setTrackingUrl(dto.getTrackingUrl().trim());
        if (dto.getShippedAt()      != null) request.setShippedAt(dto.getShippedAt());

        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.TRACKING_UPDATED)
                .request(result)
                .actorId(actorId)
                .build());

        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // FACTORY COMMENT (only the FACTORY user linked to this request)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RequestDto addFactoryComment(UUID requestId, FactoryCommentDto dto, UUID factoryUserId) {
        Request request = findById(requestId);

        // Verify the caller is the factory user linked to this request's factory
        if (request.getFactory() == null) {
            throw new BadRequestException("No factory is assigned to this request");
        }
        if (request.getFactory().getUser() == null
                || !request.getFactory().getUser().getId().equals(factoryUserId)) {
            throw new BadRequestException("You are not the factory user assigned to this request");
        }

        request.setFactoryComment(dto.getComment().trim());
        RequestDto result = requestMapper.toDto(requestRepository.save(request));

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.FACTORY_COMMENT_ADDED)
                .request(result)
                .actorId(factoryUserId)
                .actorName(request.getFactory().getName())
                .build());

        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // DELETE (CLIENT owns / ADMIN)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID id, UUID actorId, boolean isAdmin) {
        Request request = findById(id);
        if (!isAdmin && !request.getClient().getId().equals(actorId)) {
            throw new BadRequestException("You can only delete your own requests");
        }
        if (!isAdmin && request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Cannot delete a request that is already in progress");
        }
        RequestDto dto = requestMapper.toDto(request);
        requestRepository.delete(request);

        requestActionChain.process(RequestActionContext.builder()
                .actionType(RequestActionType.DELETED)
                .request(dto)
                .actorId(actorId)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private Request findById(UUID id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));
    }

    private boolean isTerminal(RequestStatus status) {
        return status == RequestStatus.COMPLETED || status == RequestStatus.REJECTED;
    }

    /**
     * Verifies the actor is either:
     *  - The consultant assigned to the request, or
     *  - The factory user linked to the factory assigned to the request.
     */
    private void verifyConsultantOrFactory(Request request, UUID actorId) {
        // Check consultant
        boolean isAssignedConsultant = request.getConsultant() != null
                && request.getConsultant().getUser() != null
                && request.getConsultant().getUser().getId().equals(actorId);

        // Check factory user
        boolean isAssignedFactory = request.getFactory() != null
                && request.getFactory().getUser() != null
                && request.getFactory().getUser().getId().equals(actorId);

        if (!isAssignedConsultant && !isAssignedFactory) {
            throw new BadRequestException(
                    "Only the assigned consultant or factory can update shipment tracking");
        }
    }

    // Kept for backward compat with RequestController
    public Page<RequestDto> getByClientId(UUID clientId, Pageable pageable, RequestStatus status) {
        return requestRepository.findByClientIdAndStatusNullable(clientId, status, pageable)
                .map(requestMapper::toDto);
    }

    public Page<RequestDto> getByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable).map(requestMapper::toDto);
    }
}
