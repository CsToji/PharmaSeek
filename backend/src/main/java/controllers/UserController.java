package controllers;

import dtos.PharmacyApprovalUpdateRequest;
import dtos.PharmacyDto;
import dtos.UserDto;
import dtos.UserRoleUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import services.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Tag(name="Users")
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(userService.getUserByIdForRequester(id, authentication));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/pharmacies/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PharmacyDto>> getPendingPharmacyRequests() {
        return ResponseEntity.ok(userService.getPendingPharmacyRequests());
    }

    @PatchMapping("/pharmacies/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PharmacyDto> updatePharmacyApprovalStatus(
            @PathVariable Long id,
            @RequestBody @Valid PharmacyApprovalUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updatePharmacyApprovalStatus(id, request.getApproved()));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody @Valid UserRoleUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }
}