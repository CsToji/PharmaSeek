package dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReservationItemDto {
    private Long id;
    private Long drugId;
    private String drugName;
    private Integer quantity;
    private BigDecimal priceAtReservation;
}

