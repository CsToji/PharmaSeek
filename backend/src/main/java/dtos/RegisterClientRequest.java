package dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterClientRequest {
    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name must be at most 120 characters")
    private String name;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    @Size(min = 8, max = 8 , message = "phone must be exactly 8 characters")
    private String phone;

    @NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
    private String password;
}
