package next.gen.consulting.repository;

import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsultantRepository extends JpaRepository<Consultant, UUID> {
    Optional<Consultant> findByUserId(UUID userId);

    List<Consultant> findByUserFullNameContainingIgnoreCase(String fullName);

    Page<Consultant> findByUserRole(UserRole role, Pageable pageable);

    List<Consultant> findByUserRole(UserRole role);
}
