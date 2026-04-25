package entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reservation_item")
public class ReservationItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id")
    private PharmacyStock stock;


    @Column(name = "quantity")
    private Integer quantity;


    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "subtotal")
    private BigDecimal subtotal;

    @Column(name = "created_at")
    private java.time.Instant createdAt;

    public Drug getDrug() {
        return stock == null ? null : stock.getDrug();
    }

    public BigDecimal getPriceAtReservation() {
        return unitPrice;
    }

    public void setPriceAtReservation(BigDecimal priceAtReservation) {
        this.unitPrice = priceAtReservation;
    }

}