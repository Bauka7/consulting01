package next.gen.consulting.controller.notification;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.notification.CreateNotificationDto;
import next.gen.consulting.dto.notification.NotificationDto;
import next.gen.consulting.service.CustomUserPrincipal;
import next.gen.consulting.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> createNotification(@Valid @RequestBody CreateNotificationDto createRequest) {
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(createRequest.getUserId())
                .message(createRequest.getMessage())
                .isRead(false)
                .build();
        NotificationDto savedNotification = notificationService.create(notificationDto);
        return ResponseEntity.ok(savedNotification);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationDto> notifications = notificationService.getByUserId(principal.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable UUID id) {
        NotificationDto updatedNotification = notificationService.markAsRead(id);
        return ResponseEntity.ok(updatedNotification);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<String> deleteNotification(@PathVariable UUID id) {
        notificationService.delete(id);
        return ResponseEntity.ok("Notification deleted");
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<String> deleteAllUserNotifications(@AuthenticationPrincipal CustomUserPrincipal principal) {
        notificationService.deleteAllByUserId(principal.getId());
        return ResponseEntity.ok("All user notifications deleted");
    }
}
