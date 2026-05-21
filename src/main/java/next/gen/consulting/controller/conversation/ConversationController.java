package next.gen.consulting.controller.conversation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.conversation.ConversationDto;
import next.gen.consulting.dto.conversation.CreateConversationDto;
import next.gen.consulting.dto.conversation.MessageDto;
import next.gen.consulting.dto.conversation.SendMessageDto;
import next.gen.consulting.service.ConversationService;
import next.gen.consulting.service.CustomUserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    // ── List all conversations for the current user ──────────────────────
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationDto>> listMyConversations(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.listMyConversations(principal.getId()));
    }

    // ── Get a single conversation (participant check inside service) ──────
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDto> getConversation(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.getConversation(id, principal.getId()));
    }

    // ── Unread count badge ────────────────────────────────────────────────
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.getUnreadCount(principal.getId()));
    }

    // ── Create or fetch existing conversation for a request ──────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT')")
    public ResponseEntity<ConversationDto> getOrCreate(
            @Valid @RequestBody CreateConversationDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.getOrCreateConversation(dto, principal.getId()));
    }

    // ── Get paginated messages ────────────────────────────────────────────
    @GetMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessageDto>> getMessages(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(conversationService.getMessages(id, principal.getId(), pageable));
    }

    // ── Send a message via REST (fallback when WebSocket unavailable) ─────
    @PostMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody SendMessageDto dto,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.sendMessage(id, dto, principal.getId()));
    }

    // ── Mark all messages in a conversation as read ───────────────────────
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(conversationService.markAllAsRead(id, principal.getId()));
    }
}
