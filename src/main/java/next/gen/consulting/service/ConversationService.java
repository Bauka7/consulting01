package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.dto.conversation.ConversationDto;
import next.gen.consulting.dto.conversation.CreateConversationDto;
import next.gen.consulting.dto.conversation.MessageDto;
import next.gen.consulting.dto.conversation.SendMessageDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.conversation.ChatMessageMapper;
import next.gen.consulting.model.*;
import next.gen.consulting.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository  chatMessageRepository;
    private final RequestRepository      requestRepository;
    private final UserRepository         userRepository;
    private final ConsultantRepository   consultantRepository;
    private final ChatMessageMapper      chatMessageMapper;
    private final NotificationService    notificationService;

    // ─────────────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────────────

    public List<ConversationDto> listMyConversations(UUID currentUserId) {
        return conversationRepository.findAllByParticipant(currentUserId)
                .stream()
                .map(c -> toDto(c, currentUserId))
                .collect(Collectors.toList());
    }

    public ConversationDto getConversation(UUID conversationId, UUID currentUserId) {
        Conversation c = findConversation(conversationId);
        requireParticipant(c, currentUserId);
        return toDto(c, currentUserId);
    }

    public long getUnreadCount(UUID currentUserId) {
        Long count = chatMessageRepository.countTotalUnreadForUser(currentUserId);
        return count == null ? 0 : count;
    }

    // ─────────────────────────────────────────────────────────────────
    // CREATE / GET-OR-CREATE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public ConversationDto getOrCreateConversation(CreateConversationDto dto, UUID currentUserId) {
        User currentUser = findUser(currentUserId);
        Request request  = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", dto.getRequestId()));

        // Idempotent: return existing if already created
        return conversationRepository.findByTypeAndRequestId(dto.getType(), dto.getRequestId())
                .map(existing -> {
                    requireParticipant(existing, currentUserId);
                    return toDto(existing, currentUserId);
                })
                .orElseGet(() -> {
                    Conversation created = buildConversation(dto.getType(), request, currentUser);
                    return toDto(conversationRepository.save(created), currentUserId);
                });
    }

    // ─────────────────────────────────────────────────────────────────
    // MESSAGES
    // ─────────────────────────────────────────────────────────────────

    public Page<MessageDto> getMessages(UUID conversationId, UUID currentUserId, Pageable pageable) {
        Conversation c = findConversation(conversationId);
        requireParticipant(c, currentUserId);
        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
                .map(chatMessageMapper::toDto);
    }

    @Transactional
    public MessageDto sendMessage(UUID conversationId, SendMessageDto dto, UUID senderId) {
        Conversation conversation = findConversation(conversationId);
        requireParticipant(conversation, senderId);

        User sender = findUser(senderId);
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(dto.getContent().trim())
                .read(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        log.debug("Message saved: conversationId={} senderId={}", conversationId, senderId);

        // Push in-app notification to the recipient (best-effort — doesn't fail the send)
        UUID recipientId = conversation.getInitiator().getId().equals(senderId)
                ? conversation.getParticipant().getId()
                : conversation.getInitiator().getId();
        try {
            notificationService.createNotification(
                    recipientId,
                    sender.getFullName() + ": " + truncate(dto.getContent(), 80),
                    conversation.getRequest().getId()
            );
        } catch (Exception ex) {
            log.warn("Failed to create message notification for user {}: {}", recipientId, ex.getMessage());
        }

        return chatMessageMapper.toDto(saved);
    }

    @Transactional
    public int markAllAsRead(UUID conversationId, UUID currentUserId) {
        Conversation c = findConversation(conversationId);
        requireParticipant(c, currentUserId);
        return chatMessageRepository.markAllAsRead(conversationId, currentUserId);
    }

    // ─────────────────────────────────────────────────────────────────
    // BUILD CONVERSATION — security rules enforced here
    // ─────────────────────────────────────────────────────────────────

    private Conversation buildConversation(ConversationType type, Request request, User currentUser) {
        return switch (type) {
            case CLIENT_CONSULTANT -> buildClientConsultant(request, currentUser);
            case CONSULTANT_FACTORY -> buildConsultantFactory(request, currentUser);
        };
    }

    /**
     * CLIENT initiates chat with the CONSULTANT assigned to their request.
     * Rules:
     *  - currentUser must be the request owner (CLIENT)
     *  - request must have a consultant assigned
     */
    private Conversation buildClientConsultant(Request request, User currentUser) {
        if (!request.getClient().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the request owner can start a client-consultant chat");
        }
        if (currentUser.getRole() != UserRole.CLIENT) {
            throw new BadRequestException("Only clients can initiate CLIENT_CONSULTANT conversations");
        }
        if (request.getConsultant() == null) {
            throw new BadRequestException("Cannot start chat: no consultant assigned to this request");
        }

        User consultantUser = request.getConsultant().getUser();
        return Conversation.builder()
                .type(ConversationType.CLIENT_CONSULTANT)
                .request(request)
                .initiator(currentUser)
                .participant(consultantUser)
                .build();
    }

    /**
     * CONSULTANT initiates chat with the FACTORY for a request assigned to them.
     * Rules:
     *  - currentUser must be a CONSULTANT
     *  - the request must be assigned to this consultant
     *  - the consultant must belong to a factory
     *  - that factory must have a user account
     */
    private Conversation buildConsultantFactory(Request request, User currentUser) {
        if (currentUser.getRole() != UserRole.CONSULTANT) {
            throw new BadRequestException("Only consultants can initiate CONSULTANT_FACTORY conversations");
        }

        Consultant consultant = consultantRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Consultant profile not found"));

        if (request.getConsultant() == null || !request.getConsultant().getId().equals(consultant.getId())) {
            throw new BadRequestException("You are not the assigned consultant for this request");
        }

        Factory factory = consultant.getFactory();
        if (factory == null) {
            throw new BadRequestException("Your account is not linked to a factory");
        }

        User factoryUser = factory.getUser();
        if (factoryUser == null) {
            throw new BadRequestException(
                    "Factory '" + factory.getName() + "' does not have a user account yet. Contact admin.");
        }

        return Conversation.builder()
                .type(ConversationType.CONSULTANT_FACTORY)
                .request(request)
                .initiator(currentUser)
                .participant(factoryUser)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private Conversation findConversation(UUID id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", id));
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private static String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen - 1) + "…";
    }

    private void requireParticipant(Conversation c, UUID userId) {
        if (!c.isParticipant(userId)) {
            throw new BadRequestException("Access denied: you are not a participant of this conversation");
        }
    }

    private ConversationDto toDto(Conversation c, UUID currentUserId) {
        UUID otherUserId = c.getInitiator().getId().equals(currentUserId)
                ? c.getParticipant().getId()
                : c.getInitiator().getId();

        User otherUser = c.getInitiator().getId().equals(currentUserId)
                ? c.getParticipant()
                : c.getInitiator();

        MessageDto lastMessage = chatMessageRepository
                .findLastMessage(c.getId())
                .map(chatMessageMapper::toDto)
                .orElse(null);

        long unread = chatMessageRepository
                .countByConversationIdAndReadFalseAndSenderIdNot(c.getId(), currentUserId);

        return ConversationDto.builder()
                .id(c.getId())
                .type(c.getType())
                .requestId(c.getRequest().getId())
                .requestProduct(c.getRequest().getProduct())
                .initiatorId(c.getInitiator().getId())
                .initiatorName(c.getInitiator().getFullName())
                .participantId(c.getParticipant().getId())
                .participantName(c.getParticipant().getFullName())
                .otherUserId(otherUserId)
                .otherUserName(otherUser.getFullName())
                .otherUserRole(otherUser.getRole().name())
                .lastMessage(lastMessage)
                .unreadCount(unread)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
