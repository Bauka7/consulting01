package next.gen.consulting.controller.factory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.consultant.ConsultantDto;
import next.gen.consulting.dto.factory.AssignFactoryUserDto;
import next.gen.consulting.dto.factory.CreateFactoryDto;
import next.gen.consulting.dto.factory.FactoryDto;
import next.gen.consulting.dto.factory.UpdateFactoryDto;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.service.CustomUserPrincipal;
import next.gen.consulting.service.FactoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/factories")
@RequiredArgsConstructor
public class FactoryController {

    private final FactoryService factoryService;

    @GetMapping
    public ResponseEntity<Page<FactoryDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID categoryId) {
        return ResponseEntity.ok(factoryService.getAll(PageRequest.of(page, size), categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FactoryDto>> search(@RequestParam(required = false) String name) {
        return ResponseEntity.ok(factoryService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactoryDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(factoryService.getById(id));
    }

    @GetMapping("/{id}/consultants")
    public ResponseEntity<Page<ConsultantDto>> getConsultants(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(factoryService.getConsultantsByFactory(id, PageRequest.of(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FactoryDto> create(@Valid @RequestBody CreateFactoryDto dto) {
        return ResponseEntity.ok(factoryService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FactoryDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateFactoryDto dto) {
        return ResponseEntity.ok(factoryService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable UUID id) {
        factoryService.delete(id);
        return ResponseEntity.ok("Factory deleted");
    }

    // ── Factory user account management (admin-only) ──────────────────────

    /**
     * Create a FACTORY-role user account and link it to this factory.
     * The factory can then log in and participate in CONSULTANT_FACTORY chats.
     */
    @PostMapping("/{id}/user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FactoryDto> createFactoryUser(
            @PathVariable UUID id,
            @Valid @RequestBody AssignFactoryUserDto dto) {
        return ResponseEntity.ok(factoryService.createFactoryUser(id, dto));
    }

    /**
     * Unlink the user account from a factory (does not delete the user).
     */
    @DeleteMapping("/{id}/user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FactoryDto> removeFactoryUser(@PathVariable UUID id) {
        return ResponseEntity.ok(factoryService.removeFactoryUser(id));
    }

    // ── Factory portal — endpoints for a logged-in FACTORY user ──────────

    /**
     * Factory user sees their own factory profile.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('FACTORY')")
    public ResponseEntity<FactoryDto> getMyFactory(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(factoryService.getMyFactory(principal.getId()));
    }

    /**
     * Factory user sees requests directed at their factory.
     */
    @GetMapping("/my/requests")
    @PreAuthorize("hasRole('FACTORY')")
    public ResponseEntity<Page<RequestDto>> getMyRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                factoryService.getMyRequests(principal.getId(), PageRequest.of(page, size)));
    }
}
