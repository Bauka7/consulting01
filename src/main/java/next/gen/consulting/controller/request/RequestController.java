package next.gen.consulting.controller.request;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.*;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.repository.FactoryRepository;
import next.gen.consulting.service.CustomUserPrincipal;
import next.gen.consulting.service.RequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final FactoryRepository factoryRepository;

    // ── Queries ──────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<Page<RequestDto>> getAll(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(requestService.getAll(PageRequest.of(page, size), status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN', 'FACTORY')")
    public ResponseEntity<RequestDto> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        RequestDto dto = requestService.getById(id);
        verifyReadAccess(dto, principal);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Page<RequestDto>> getMyRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                requestService.getMyRequests(principal.getId(), PageRequest.of(page, size), status));
    }

    @GetMapping("/consultant")
    @PreAuthorize("hasRole('CONSULTANT')")
    public ResponseEntity<Page<RequestDto>> getConsultantRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                requestService.getConsultantRequests(principal.getId(), PageRequest.of(page, size)));
    }

    // ── Create ───────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<RequestDto> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateRequestDto dto) {
        return ResponseEntity.ok(requestService.create(dto, principal.getId()));
    }

    // ── Update (client edits own request fields) ─────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<RequestDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequestDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = hasRole(principal, "ROLE_ADMIN");
        return ResponseEntity.ok(requestService.update(id, dto, principal.getId(), isAdmin));
    }

    // ── Status change (consultant / admin) ───────────────────────────────

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<RequestDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam RequestStatus status,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = hasRole(principal, "ROLE_ADMIN");
        return ResponseEntity.ok(
                requestService.updateStatus(id, status, principal.getId(), isAdmin, comment));
    }

    // ── Assign factory (consultant for their own factory / admin) ─────────

    @PatchMapping("/{id}/assign-factory")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<RequestDto> assignFactory(
            @PathVariable UUID id,
            @RequestParam UUID factoryId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = hasRole(principal, "ROLE_ADMIN");
        return ResponseEntity.ok(
                requestService.assignFactory(id, factoryId, principal.getId(), isAdmin));
    }

    // ── Update tracking (consultant / factory / admin) ────────────────────

    @PatchMapping("/{id}/tracking")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'FACTORY', 'ADMIN')")
    public ResponseEntity<RequestDto> updateTracking(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTrackingDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = hasRole(principal, "ROLE_ADMIN");
        return ResponseEntity.ok(
                requestService.updateTracking(id, dto, principal.getId(), isAdmin));
    }

    // ── Factory comment (factory only) ────────────────────────────────────

    @PatchMapping("/{id}/factory-comment")
    @PreAuthorize("hasRole('FACTORY')")
    public ResponseEntity<RequestDto> addFactoryComment(
            @PathVariable UUID id,
            @Valid @RequestBody FactoryCommentDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(
                requestService.addFactoryComment(id, dto, principal.getId()));
    }

    // ── Delete (client own PENDING / admin) ──────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<String> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = hasRole(principal, "ROLE_ADMIN");
        requestService.delete(id, principal.getId(), isAdmin);
        return ResponseEntity.ok("Request deleted");
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private boolean hasRole(CustomUserPrincipal principal, String role) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }

    /**
     * Ensures the caller is allowed to READ this request:
     *  - ADMIN:      always
     *  - CONSULTANT: always (they may be looking up a client's request to accept it)
     *  - CLIENT:     only their own requests
     *  - FACTORY:    only requests assigned to their factory
     */
    private void verifyReadAccess(RequestDto dto, CustomUserPrincipal principal) {
        if (hasRole(principal, "ROLE_ADMIN") || hasRole(principal, "ROLE_CONSULTANT")) return;

        if (hasRole(principal, "ROLE_CLIENT")) {
            if (!dto.getClientId().equals(principal.getId())) {
                throw new BadRequestException("Access denied: this is not your request");
            }
            return;
        }

        if (hasRole(principal, "ROLE_FACTORY")) {
            // Factory user may only read requests assigned to their factory
            boolean linked = dto.getFactoryId() != null
                    && factoryRepository.findByUserId(principal.getId())
                            .map(f -> f.getId().equals(dto.getFactoryId()))
                            .orElse(false);
            if (!linked) {
                throw new BadRequestException("Access denied: this request is not assigned to your factory");
            }
        }
    }
}
