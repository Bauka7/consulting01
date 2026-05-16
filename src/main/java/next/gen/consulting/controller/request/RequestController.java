package next.gen.consulting.controller.request;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.CreateRequestDto;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.dto.request.UpdateRequestDto;
import next.gen.consulting.model.RequestStatus;
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

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<RequestDto> createRequest(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateRequestDto createRequest) {
        RequestDto savedRequest = requestService.create(createRequest, principal.getId());
        return ResponseEntity.ok(savedRequest);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<Page<RequestDto>> getMyRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<RequestDto> requests = requestService.getMyRequests(principal.getId(), PageRequest.of(page, size), status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/consultant")
    @PreAuthorize("hasRole('CONSULTANT')")
    public Page<RequestDto> getConsultantRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return requestService.getConsultantRequests(principal.getId(), PageRequest.of(page, size));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<Page<RequestDto>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<RequestDto> requests = requestService.getAll(PageRequest.of(page, size), status);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<RequestDto> getRequestById(@PathVariable UUID id) {
        RequestDto request = requestService.getById(id);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<RequestDto> updateRequest(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequestDto updateRequest,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        RequestDto updatedRequest = requestService.update(id, updateRequest, principal.getId(), isAdmin);
        return ResponseEntity.ok(updatedRequest);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<RequestDto> updateRequestStatus(
            @PathVariable UUID id,
            @RequestParam RequestStatus status,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String comment) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        RequestDto updatedRequest = requestService.updateStatus(id, status, principal.getId(), isAdmin, comment);
        return ResponseEntity.ok(updatedRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<String> deleteRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        requestService.delete(id, principal.getId(), isAdmin);
        return ResponseEntity.ok("Request deleted");
    }

}
