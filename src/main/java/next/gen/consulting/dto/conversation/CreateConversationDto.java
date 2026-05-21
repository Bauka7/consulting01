package next.gen.consulting.dto.conversation;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import next.gen.consulting.model.ConversationType;

import java.util.UUID;

@Data
public class CreateConversationDto {

    @NotNull(message = "Request ID is required")
    private UUID requestId;

    @NotNull(message = "Conversation type is required")
    private ConversationType type;
}
