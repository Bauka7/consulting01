package next.gen.consulting.repository;

import next.gen.consulting.model.Factory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FactoryRepository extends JpaRepository<Factory, UUID> {

    Page<Factory> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Factory> findByCategoriesId(UUID categoryId, Pageable pageable);

    List<Factory> findByCategoriesId(UUID categoryId);

    Optional<Factory> findByUserId(UUID userId);
}
