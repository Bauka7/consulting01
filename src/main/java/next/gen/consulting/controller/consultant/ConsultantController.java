package next.gen.consulting.controller.consultant;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.consultant.ConsultantDto;
import next.gen.consulting.dto.consultant.CreateConsultantDto;
import next.gen.consulting.dto.consultant.UpdateConsultantDto;
import next.gen.consulting.service.ConsultantService;
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
@RequestMapping("/api/consultants")
@RequiredArgsConstructor
public class ConsultantController {

    private final ConsultantService consultantService;
    private final FactoryService factoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantDto> createConsultant(@Valid @RequestBody CreateConsultantDto createRequest) {
        return ResponseEntity.ok(consultantService.create(createRequest));
    }

    @GetMapping
    public ResponseEntity<Page<ConsultantDto>> getAllConsultants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(consultantService.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ConsultantDto>> searchConsultants(
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(consultantService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultantDto> getConsultantById(@PathVariable UUID id) {
        return ResponseEntity.ok(consultantService.getById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ConsultantDto> getConsultantByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(consultantService.getByUserId(userId));
    }

    @GetMapping("/by-factory/{factoryId}")
    public ResponseEntity<Page<ConsultantDto>> getConsultantsByFactory(
            @PathVariable UUID factoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                factoryService.getConsultantsByFactory(factoryId, PageRequest.of(page, size))
        );
    }

    @PutMapping("/my")
    @PreAuthorize("hasAnyRole('CONSULTANT')")
    public ResponseEntity<ConsultantDto> updateMyConsultant(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody UpdateConsultantDto updateRequest) {
        return ResponseEntity.ok(consultantService.updateByUserId(principal.getId(), updateRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteConsultant(@PathVariable UUID id) {
        consultantService.delete(id);
        return ResponseEntity.ok("Consultant deleted");
    }
}
