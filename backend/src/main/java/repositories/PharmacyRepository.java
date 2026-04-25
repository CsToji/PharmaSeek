package repositories;

import entities.Pharmacy;
import entities.PharmacyApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    boolean existsByTaxId(String taxId);
    Optional<Pharmacy> findByUserId(Long userId);
    List<Pharmacy> findByApprovalStatus(PharmacyApprovalStatus approvalStatus);
}
