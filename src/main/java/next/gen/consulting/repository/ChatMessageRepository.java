package next.gen.consulting.repository;

import next.gen.consulting.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Page<ChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);

    long countByConversationIdAndReadFalseAndSenderIdNot(UUID conversationId, UUID currentUserId);

    @Query("""
        SELECT SUM(CASE WHEN m.read = false AND m.sender.id <> :userId THEN 1 ELSE 0 END)
        FROM ChatMessage m
        WHERE m.conversation.initiator.id = :userId OR m.conversation.participant.id = :userId
        """)
    Long countTotalUnreadForUser(@Param("userId") UUID userId);

    @Modifying
    @Query("""
        UPDATE ChatMessage m SET m.read = true
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.read = false
        """)
    int markAllAsRead(@Param("conversationId") UUID conversationId,
                      @Param("userId") UUID userId);

    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.conversation.id = :conversationId
        ORDER BY m.createdAt DESC
        LIMIT 1
        """)
    Optional<ChatMessage> findLastMessage(@Param("conversationId") UUID conversationId);
}
