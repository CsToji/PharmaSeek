package dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReservationStatusUpdateRequest {
    @NotBlank(message = "status is required")
    private String status;
}

