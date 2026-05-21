package next.gen.consulting.service.request;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.User;
import next.gen.consulting.model.UserRole;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.UserRepository;
import next.gen.consulting.service.NotificationService;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@Slf4j
public class RequestNotificationHandler extends AbstractRequestActionHandler {

    private final UserRepository userRepository;
    private final ConsultantRepository consultantRepository;
    private final NotificationService notificationService;

    @Override
    protected void doHandle(RequestActionContext context) {
        RequestDto request = context.getRequest();
        if (request == null) {
            return;
        }

        switch (context.getActionType()) {
            case CREATED -> notifyAdminsAndConsultants(
                    "New request: \"" + request.getProduct() + "\"");

            case CONSULTANT_ASSIGNED -> {
                notifyUser(context.getActorId(),
                        "You have been assigned to request \"" + request.getProduct() + "\".",
                        request.getId());
                notifyAdmins("Consultant assigned to \"" + request.getProduct() + "\".");
            }

            case FACTORY_ASSIGNED -> {
                // Notify the factory user
                notifyUser(context.getTargetUserId(),
                        "A new request has been forwarded to your factory: \""
                                + request.getProduct() + "\".",
                        request.getId());
                notifyAdmins("Factory assigned to request \"" + request.getProduct() + "\".");
            }

            case STATUS_CHANGED -> {
                String statusLabel = switch (request.getStatus()) {
                    case PROGRESS -> "In Progress";
                    case COMPLETED -> "Completed";
                    case REJECTED -> "Rejected";
                    default -> request.getStatus().name();
                };
                notifyAdmins("Request \"" + request.getProduct() + "\" → " + statusLabel + ".");
            }

            case TRACKING_UPDATED ->
                    notifyAdmins("Tracking updated for request \"" + request.getProduct() + "\".");

            case FACTORY_COMMENT_ADDED -> {
                // Notify the assigned consultant that the factory replied
                if (request.getConsultantId() != null) {
                    notifyUserByConsultantId(request.getConsultantId(),
                            "Factory \"" + context.getActorName() + "\" left a comment on request \""
                                    + request.getProduct() + "\".",
                            request.getId());
                }
            }

            default -> { }
        }
    }

    private void notifyAdminsAndConsultants(String message) {
        List<User> users = userRepository.findAllByRole_AdminOrConsultant();
        if (users.isEmpty()) {
            log.debug("No users found for notification message: {}", message);
            return;
        }

        users.stream()
                .map(User::getId)
                .forEach(userId -> {
                    try {
                        notificationService.createNotification(userId, message);
                    } catch (Exception ex) {
                        log.error("Failed to notify user {}: {}", userId, ex.getMessage(), ex);
                    }
                });
    }

    private void notifyUser(UUID userId, String message, UUID requestId) {
        if (userId == null) return;
        try {
            notificationService.createNotification(userId, message, requestId);
        } catch (Exception ex) {
            log.error("Failed to notify user {}: {}", userId, ex.getMessage(), ex);
        }
    }

    /** Resolves consultant → user ID, then sends a notification. */
    private void notifyUserByConsultantId(UUID consultantId, String message, UUID requestId) {
        if (consultantId == null) return;
        Optional<Consultant> opt = consultantRepository.findById(consultantId);
        if (opt.isEmpty()) return;
        notifyUser(opt.get().getUser().getId(), message, requestId);
    }

    private void notifyAdmins(String message) {
        List<User> users = userRepository.findAllByRole(UserRole.ADMIN);
        if (users.isEmpty()) {
            log.debug("No users found for notification message: {}", message);
            return;
        }

        users.stream()
                .map(User::getId)
                .forEach(userId -> {
                    try {
                        notificationService.createNotification(userId, message);
                    } catch (Exception ex) {
                        log.error("Failed to notify user {}: {}", userId, ex.getMessage(), ex);
                    }
                });
    }

}
