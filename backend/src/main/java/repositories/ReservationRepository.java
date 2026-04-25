package repositories;

import entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByClientId(Long clientId);

    List<Reservation> findByPharmacyId(Long pharmacyId);

    Optional<Reservation> findByIdAndClientId(Long id, Long clientId);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = :status WHERE r.id = :id")
    int updateStatusById(@Param("id") Long id, @Param("status") String status);

    void deleteByClientId(Long clientId);
}

