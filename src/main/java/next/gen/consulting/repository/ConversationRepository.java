package next.gen.consulting.repository;

import next.gen.consulting.model.Conversation;
import next.gen.consulting.model.ConversationType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByTypeAndRequestId(ConversationType type, UUID requestId);

    /** Eager-fetch initiator + participant in one query (needed for WebSocket dispatch). */
    @EntityGraph(attributePaths = {"initiator", "participant"})
    @Query("SELECT c FROM Conversation c WHERE c.id = :id")
    Optional<Conversation> findByIdWithParticipants(@Param("id") UUID id);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.initiator.id = :userId OR c.participant.id = :userId
        ORDER BY c.updatedAt DESC
        """)
    List<Conversation> findAllByParticipant(@Param("userId") UUID userId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.initiator.id = :userId OR c.participant.id = :userId)
          AND c.request.id = :requestId
        ORDER BY c.type
        """)
    List<Conversation> findByParticipantAndRequest(
            @Param("userId") UUID userId,
            @Param("requestId") UUID requestId);

    @Query("""
        SELECT COUNT(c) > 0 FROM Conversation c
        WHERE c.id = :conversationId
          AND (c.initiator.id = :userId OR c.participant.id = :userId)
        """)
    boolean isParticipant(@Param("conversationId") UUID conversationId,
                          @Param("userId") UUID userId);
}
