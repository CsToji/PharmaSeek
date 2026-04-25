package entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reservation")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id")
    private Client client;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;


    @Column(name = "status")
    private String status;

    @Column(name = "total")
    private BigDecimal totalPrice;


    @Column(name = "reservation_date")
    private Instant reservedAt;

    @Column(name = "expiration_date")
    private Instant expirationTime;

    @Column(name = "notes")
    private String notes;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "reservation", fetch = FetchType.LAZY)
    private List<ReservationItem> items;

}