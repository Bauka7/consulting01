package next.gen.consulting.service.request;

import lombok.Builder;
import lombok.Getter;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.model.RequestStatus;

import java.util.UUID;

@Getter
@Builder
public class RequestActionContext {
    private final RequestActionType actionType;
    private final RequestDto request;
    private final RequestStatus previousStatus;
    private final UUID actorId;
    /** Human-readable name of the actor (consultant name, factory name, etc.) for notifications. */
    private final String actorName;
    /** ID of a secondary target user to notify (e.g., factory user on factory assignment). */
    private final UUID targetUserId;
}

