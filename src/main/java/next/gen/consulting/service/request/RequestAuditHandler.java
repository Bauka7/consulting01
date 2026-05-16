package next.gen.consulting.service.request;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.service.AuditLogService;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
public class RequestAuditHandler extends AbstractRequestActionHandler {

    private final AuditLogService auditLogService;

    @Override
    protected void doHandle(RequestActionContext context) {
        RequestDto request = context.getRequest();
        if (request == null) return;

        String action;
        String description;

        switch (context.getActionType()) {
            case CREATED -> {
                action = "REQUEST_CREATED";
                description = "Request \"" + request.getProduct() + "\" created by " + request.getFullName();
            }
            case STATUS_CHANGED -> {
                String statusLabel = switch (request.getStatus()) {
                    case PROGRESS -> "In Progress";
                    case COMPLETED -> "Completed";
                    case REJECTED -> "Rejected";
                    default -> request.getStatus().name();
                };
                action = "REQUEST_STATUS_CHANGED";
                description = "Request \"" + request.getProduct() + "\" → " + statusLabel;
            }
            case CONSULTANT_ASSIGNED -> {
                action = "CONSULTANT_ASSIGNED";
                description = "Consultant assigned to request \"" + request.getProduct() + "\"";
            }
            case UPDATED -> {
                action = "REQUEST_UPDATED";
                description = "Request \"" + request.getProduct() + "\" was updated";
            }
            default -> { return; }
        }

        auditLogService.logAction(action, description, "REQUEST", request.getId());
    }
}
