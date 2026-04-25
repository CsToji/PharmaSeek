package controllers;

import dtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.mapstruct.Mapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import repositories.UserRepository;
import services.AuthService;

@AllArgsConstructor
@RestController
@RequestMapping("/auth")
@Tag(name="Authentication")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/signup/client")
    @Operation(summary = "Signup a Client")
    public ResponseEntity<ClientDto> registerClient(@RequestBody @Valid RegisterClientRequest request) {
        var clientDto = authService.registerClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(clientDto);
    }

    @PostMapping("/signup/pharmacy")
    public ResponseEntity<PharmacyDto> registerPharmacy(@RequestBody @Valid RegisterPharmacyRequest request) {
        var pharmacyDto = authService.registerPharmacy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyDto);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @RequestBody @Valid LoginRequestBody request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.refresh(refreshToken, response));
    }

    @GetMapping("/current")
    public ResponseEntity<UserDto> current(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication));
    }

    @GetMapping("/me")
    public ResponseEntity getCurrentUserProfile(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(authentication));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        } else if (!userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("There is no user with that email address.");
        }
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().body("A password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok().body("Password has been successfully reset.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}