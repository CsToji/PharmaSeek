package dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RegisterPharmacyRequest {

    @NotBlank(message = "pharmacy name is required")
    @Size(max = 120, message = "pharmacy name must be at most 120 characters")
    private String pharmacyName;

    @NotBlank(message = "Tax Id is required")
    private String taxId;

    @NotBlank(message="email is required")
    @Email
    private String email;

    @NotBlank(message = "address is required")
    private String address;


    @NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
    private String password;

    private BigDecimal latitude;

    private BigDecimal longitude;

}
