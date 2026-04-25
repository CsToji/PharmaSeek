package dtos;

import lombok.Data;

import java.math.BigDecimal;


@Data
public class PharmacyStockDto {
    private Long id;
    private Long pharmacyId;
    private Long drugId;
    private String drugName;
    private Integer quantity;
    private BigDecimal price;
    private String pharmacyName;
    private String pharmacyAddress;
    private Integer reservationDelayMinutes;
    private Double latitude;
    private Double longitude;
}