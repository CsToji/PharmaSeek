package repositories;

import entities.Drug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DrugRepository extends JpaRepository<Drug, Long> {
    Optional<Drug> findByNameIgnoreCase(String name);
    List<Drug> findByNameContainingIgnoreCase(String name);
}