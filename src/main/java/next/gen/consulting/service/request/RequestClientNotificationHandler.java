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
                    "Your request \"" + request.getProduct() + "\" was created and is awaiting review.",
                    requestId
            );
            case CONSULTANT_ASSIGNED -> notifyClient(
                    request.getClientId(),
                    "A consultant has been assigned to your request \"" + request.getProduct() + "\".",
                    requestId
            );
            case FACTORY_ASSIGNED -> {
                String factoryName = context.getActorName() != null ? context.getActorName() : "a factory";
                notifyClient(
                        request.getClientId(),
                        "Your request \"" + request.getProduct() + "\" has been forwarded to " + factoryName + ".",
                        requestId
                );
            }
            case STATUS_CHANGED -> {
                RequestStatus newStatus = request.getStatus();
                String message = switch (newStatus) {
                    case PROGRESS   -> "Your request \"" + request.getProduct() + "\" is now being processed.";
                    case COMPLETED  -> "Your request \"" + request.getProduct() + "\" has been completed. 🎉";
                    case REJECTED   -> "Your request \"" + request.getProduct() + "\" was rejected."
                            + (request.getComment() != null ? " Reason: " + request.getComment() : "");
                    default -> "Your request \"" + request.getProduct() + "\" status changed to: " + newStatus.name() + ".";
                };
                notifyClient(request.getClientId(), message, requestId);
            }
            case TRACKING_UPDATED -> {
                String tracking = request.getTrackingNumber() != null
                        ? " Tracking: " + request.getTrackingNumber() : "";
                notifyClient(
                        request.getClientId(),
                        "Your order \"" + request.getProduct() + "\" has been shipped!" + tracking,
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
