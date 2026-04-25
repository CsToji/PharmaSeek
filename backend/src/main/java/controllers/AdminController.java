package controllers;

import dtos.AdminStatsDto;
import dtos.DrugDto;
import dtos.PharmacyApprovalUpdateRequest;
import dtos.PharmacyDto;
import dtos.ReservationDto;
import dtos.UserDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import services.AdminService;
import services.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@Tag(name = "Admin")
public class AdminController {
    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/pharmacies/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PharmacyDto>> getPendingPharmacies() {
        return ResponseEntity.ok(adminService.getPendingPharmacies());
    }

    @PatchMapping("/pharmacies/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PharmacyDto> updatePharmacyApprovalStatus(
            @PathVariable Long id,
            @RequestBody @Valid PharmacyApprovalUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updatePharmacyApprovalStatus(id, request.getApproved()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/pharmacies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PharmacyDto>> getAllPharmacies() {
        return ResponseEntity.ok(adminService.getAllPharmacies());
    }

    @GetMapping("/reservations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        return ResponseEntity.ok(adminService.getAllReservations());
    }

    @GetMapping("/drugs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DrugDto>> getAllDrugs() {
        return ResponseEntity.ok(adminService.getAllDrugs());
    }
}