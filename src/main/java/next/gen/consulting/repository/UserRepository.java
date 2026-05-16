package next.gen.consulting.repository;

import next.gen.consulting.model.User;
import next.gen.consulting.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findFirstByPhoneIn(Collection<String> phones);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByPhoneIn(Collection<String> phones);
    List<User> findAllByRole(UserRole role);

    @Query("""
        SELECT u FROM User u
        WHERE u.role = 'ADMIN' OR u.role = 'CONSULTANT'
    """)
    List<User> findAllByRole_AdminOrConsultant();

    @Modifying
    @Query(value = "DELETE FROM users WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(UUID id);
}
