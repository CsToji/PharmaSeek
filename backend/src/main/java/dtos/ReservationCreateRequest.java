package dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReservationCreateRequest {
    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotNull(message = "pharmacyId is required")
    private Long pharmacyId;

    private String notes;

    @Valid
    @NotEmpty(message = "items must not be empty")
    private List<ReservationItemRequest> items;
    
}
