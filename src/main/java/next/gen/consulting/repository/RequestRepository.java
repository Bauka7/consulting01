package next.gen.consulting.repository;

import next.gen.consulting.model.Request;
import next.gen.consulting.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {
    List<Request> findByClientId(UUID clientId);
    List<Request> findByConsultantId(UUID consultantId);
    List<Request> findByConsultantIdAndStatusIn(UUID consultantId, List<RequestStatus> statuses);
    boolean existsByClientIdAndStatusIn(UUID clientId, List<RequestStatus> statuses);
    boolean existsByConsultantIdAndStatusIn(UUID consultantId, List<RequestStatus> statuses);
    List<Request> findByStatus(RequestStatus status);
    Page<Request> findByClientId(UUID clientId, Pageable pageable);
    Page<Request> findByStatus(RequestStatus status, Pageable pageable);
    Page<Request> findByConsultantUserId(UUID userId, Pageable pageable);

    @Query("""
            SELECT r FROM Request r
            WHERE r.client.id = :clientId
            AND (:status IS NULL OR r.status = :status)
    """)
    Page<Request> findByClientIdAndStatusNullable(
            @Param("clientId") UUID clientId,
            @Param("status") RequestStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT r FROM Request r
            WHERE (:status IS NULL OR r.status = :status)
    """)
    Page<Request> findByStatusNull(@Param("status") RequestStatus status, Pageable pageable);
}
