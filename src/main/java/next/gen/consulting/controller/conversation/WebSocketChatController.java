package next.gen.consulting.controller.conversation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.dto.conversation.MessageDto;
import next.gen.consulting.dto.conversation.SendMessageDto;
import next.gen.consulting.model.Conversation;
import next.gen.consulting.repository.ConversationRepository;
import next.gen.consulting.service.ConversationService;
import next.gen.consulting.service.CustomUserPrincipal;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.UUID;

/**
 * Handles real-time STOMP messages.
 *
 * Client subscribes to:
 *   /user/queue/messages          — their private incoming message feed
 *   /topic/conversations/{id}     — conversation-scoped broadcast (both participants)
 *
 * Client sends to:
 *   /app/conversations/{id}/send  — this handler
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ConversationService conversationService;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable UUID conversationId,
            @Valid @Payload SendMessageDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        MessageDto saved = conversationService.sendMessage(conversationId, dto, principal.getId());

        // 1. Broadcast to the conversation topic so both participants receive it
        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId, saved);

        // 2. Also push to the recipient's personal queue (for unread badge updates).
        //    Use the eager-fetch variant to avoid LazyInitializationException.
        Conversation conversation = conversationRepository
                .findByIdWithParticipants(conversationId).orElse(null);
        if (conversation != null) {
            // recipient's phone is their STOMP principal name (username == phone in this app)
            String recipientPhone = conversation.getInitiator().getId().equals(principal.getId())
                    ? conversation.getParticipant().getPhone()
                    : conversation.getInitiator().getPhone();

            messagingTemplate.convertAndSendToUser(
                    recipientPhone, "/queue/messages", saved);

            log.debug("WS message dispatched: conversationId={} from={} to={}",
                    conversationId, principal.getUsername(), recipientPhone);
        }
    }
}
