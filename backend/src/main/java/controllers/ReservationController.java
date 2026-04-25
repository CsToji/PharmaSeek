package controllers;

import dtos.ReservationCreateRequest;
import dtos.ReservationDto;
import dtos.ReservationStatusUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import services.ReservationService;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@AllArgsConstructor
@Tag(name = "Reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACY', 'CLIENT')")
    public ResponseEntity<ReservationDto> getReservationById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(reservationService.getReservationByIdForRequester(id, authentication));
    }

    @PostMapping()
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<ReservationDto> createReservation(@RequestBody @Valid ReservationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACY')")
    public ResponseEntity<ReservationDto> updateReservation(@PathVariable Long id, @RequestBody ReservationDto reservationDto) {
        return reservationService.updateReservation(id, reservationDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACY')")
    public ResponseEntity<ReservationDto> updateReservationStatus(
            @PathVariable Long id,
            @RequestBody @Valid ReservationStatusUpdateRequest request
    ) {
        return reservationService.updateReservationStatus(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        if (reservationService.deleteReservation(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<List<ReservationDto>> getReservationsByClientId(@PathVariable Long clientId, Authentication authentication) {
        return ResponseEntity.ok(reservationService.getReservationsByClientIdForRequester(clientId, authentication));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationDto>> getMyReservations(Authentication authentication) {
        return ResponseEntity.ok(reservationService.getMyReservations(authentication));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<ReservationDto> getMyReservationById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(reservationService.getMyReservationById(id, authentication));
    }

    @GetMapping("/pharmacy/me")
    @PreAuthorize("hasAnyRole('PHARMACY')")
    public ResponseEntity<List<ReservationDto>> getMyPharmacyReservations(Authentication authentication) {
        return ResponseEntity.ok(reservationService.getPharmacyReservationsForPharmacy(authentication));
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACY')")
    public ResponseEntity<List<ReservationDto>> getReservationsByPharmacyId(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(reservationService.getReservationsByPharmacyId(pharmacyId));
    }
}


