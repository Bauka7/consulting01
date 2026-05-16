package next.gen.consulting.controller.contactLink;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.contactLink.ContactLinkDto;
import next.gen.consulting.dto.contactLink.CreateContactLinkDto;
import next.gen.consulting.dto.contactLink.UpdateContactLinkDto;
import next.gen.consulting.service.ContactLinkService;
import next.gen.consulting.service.CustomUserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contact-links")
@RequiredArgsConstructor
public class ContactLinkController {

    private final ContactLinkService contactLinkService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<ContactLinkDto> createContactLink(
            @Valid @RequestBody CreateContactLinkDto createRequest,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(contactLinkService.create(principal.getId(), createRequest));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContactLinkDto>> getContactLinksByConsultant(@PathVariable UUID userId) {
        return ResponseEntity.ok(contactLinkService.getByConsultantId(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ContactLinkDto>> getAllContactLinks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(contactLinkService.getAll(PageRequest.of(page, size)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<ContactLinkDto> updateContactLink(
            @PathVariable UUID id,
            @RequestBody UpdateContactLinkDto updateRequest) {
        return ResponseEntity.ok(contactLinkService.update(id, updateRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CONSULTANT', 'ADMIN')")
    public ResponseEntity<String> deleteContactLink(@PathVariable UUID id) {
        contactLinkService.delete(id);
        return ResponseEntity.ok("Contact link deleted");
    }
}
