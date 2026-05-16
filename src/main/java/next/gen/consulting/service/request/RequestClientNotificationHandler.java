package next.gen.consulting.service.request;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.service.NotificationService;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;


@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestClientNotificationHandler extends AbstractRequestActionHandler {

    private final NotificationService notificationService;

    @Override
    protected void doHandle(RequestActionContext context) {
        RequestDto request = context.getRequest();
        if (request == null || request.getClientId() == null) {
            return;
        }

        UUID requestId = request.getId();

        switch (context.getActionType()) {
            case CREATED -> notifyClient(
                    request.getClientId(),
                    "Your request \"" + request.getProduct() + "\" was created successfully and is awaiting review.",
                    requestId
            );
            case CONSULTANT_ASSIGNED -> notifyClient(
                    request.getClientId(),
                    "A consultant has been assigned to your request \"" + request.getProduct() + "\".",
                    requestId
            );
            case STATUS_CHANGED -> {
                RequestStatus newStatus = request.getStatus();
                String statusLabel = switch (newStatus) {
                    case PROGRESS -> "In Progress";
                    case COMPLETED -> "Completed";
                    case REJECTED -> "Rejected";
                    default -> newStatus.name();
                };
                notifyClient(
                        request.getClientId(),
                        "Your request \"" + request.getProduct() + "\" status changed to: " + statusLabel + ".",
                        requestId
                );
            }
            default -> {
            }
        }
    }

    private void notifyClient(UUID clientId, String message, UUID requestId) {
        try {
            notificationService.createNotification(clientId, message, requestId);
        } catch (Exception ex) {
            log.error("Failed to create notification for client {}: {}", clientId, ex.getMessage(), ex);
        }
    }

}
