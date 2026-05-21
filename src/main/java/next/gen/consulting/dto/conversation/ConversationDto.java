package next.gen.consulting.dto.conversation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import next.gen.consulting.model.ConversationType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private UUID id;
    private ConversationType type;
    private UUID requestId;
    private String requestProduct;

    private UUID initiatorId;
    private String initiatorName;

    private UUID participantId;
    private String participantName;

    // For current user: who is the other person
    private UUID otherUserId;
    private String otherUserName;
    private String otherUserRole;

    private MessageDto lastMessage;
    private long unreadCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
