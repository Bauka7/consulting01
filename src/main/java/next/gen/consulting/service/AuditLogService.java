package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.model.AuditLog;
import next.gen.consulting.model.User;
import next.gen.consulting.repository.AuditLogRepository;
import next.gen.consulting.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(String action, String description, String entityType, UUID entityId, InetAddress ipAddress) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                try {
                    user = userRepository.findByPhone(auth.getName()).orElse(null);
                } catch (Exception e) {
                    log.debug("Could not find user for phone: {}", auth.getName());
                }
            }

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .description(description)
                    .entityType(entityType)
                    .entityId(entityId)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {}", action);
        } catch (Exception e) {
            log.error("Error creating audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void logAction(String action, String description, String entityType, UUID entityId) {
        logAction(action, description, entityType, entityId, null);
    }

    @Transactional
    public void logAction(String action, String description) {
        logAction(action, description, null, null, null);
    }

    public void logUserAction(String action, String description) {
        logAction(action, description);
    }
}
