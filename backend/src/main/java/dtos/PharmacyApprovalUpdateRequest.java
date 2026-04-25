package dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PharmacyApprovalUpdateRequest {
    @NotNull(message = "approved is required")
    private Boolean approved;
}
