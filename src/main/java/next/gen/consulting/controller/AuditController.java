package next.gen.consulting.controller;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.model.AuditLog;
import next.gen.consulting.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public record UserSummary(UUID id, String fullName, String phone) {}
    public record AuditLogDto(UUID id, String action, String description, String entityType,
                               UUID entityId, String createdAt, UserSummary user) {}

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLogDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AuditLogDto> logs = auditLogRepository
                .findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toDto);
        return ResponseEntity.ok(logs);
    }

    private AuditLogDto toDto(AuditLog log) {
        UserSummary userSummary = log.getUser() == null ? null
                : new UserSummary(log.getUser().getId(), log.getUser().getFullName(), log.getUser().getPhone());
        String createdAt = log.getCreatedAt() == null ? null : log.getCreatedAt().toString();
        return new AuditLogDto(log.getId(), log.getAction(), log.getDescription(),
                log.getEntityType(), log.getEntityId(), createdAt, userSummary);
    }
}
