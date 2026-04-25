package dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class ReservationDto {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long pharmacyId;
    private String pharmacyName;
    private Double pharmacyLatitude;
    private Double pharmacyLongitude;
    private String status;
    private BigDecimal totalPrice;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+1")
    private Instant reservedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+1")
    private Instant expirationTime;

    private List<ReservationItemDto> items;
}
