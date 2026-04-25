package controllers;

import dtos.CreateStockWithDrugRequest;
import dtos.DrugDto;
import dtos.PharmacyStockDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import services.PharmacyStockService;

import java.util.List;

@RestController
@RequestMapping("/pharmacy-stock")
@AllArgsConstructor
@Tag(name="Pharmacy Stock")
public class PharmacyStockController {

    private final PharmacyStockService pharmacyStockService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<PharmacyStockDto>> getAllPharmacyStock() {
        return ResponseEntity.ok(pharmacyStockService.getAllPharmacyStock());
    }

    @GetMapping("")
    @PreAuthorize("hasAnyRole('PHARMACY')")
    public ResponseEntity<List<PharmacyStockDto>> getMyPharmacyStock(Authentication authentication) {
        return ResponseEntity.ok(pharmacyStockService.getMyPharmacyStock(authentication));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<PharmacyStockDto> getPharmacyStockById(@PathVariable Long id, Authentication authentication) {
        return pharmacyStockService.getPharmacyStockById(id, authentication)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('PHARMACY','ADMIN')")
    public ResponseEntity<PharmacyStockDto> createPharmacyStock(
            @RequestBody PharmacyStockDto pharmacyStockDto,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pharmacyStockService.createPharmacyStock(pharmacyStockDto, authentication));
    }

    @PostMapping("/with-drug")
    @PreAuthorize("hasAnyRole('PHARMACY','ADMIN')")
    public ResponseEntity<PharmacyStockDto> createPharmacyStockWithDrug(
            @RequestBody CreateStockWithDrugRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pharmacyStockService.createPharmacyStockWithNewDrug(request.getStock(), request.getDrug(), authentication));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<PharmacyStockDto> updatePharmacyStock(
            @PathVariable Long id,
            @RequestBody PharmacyStockDto pharmacyStockDto,
            Authentication authentication
    ) {
        return pharmacyStockService.updatePharmacyStock(id, pharmacyStockDto, authentication)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<Void> deletePharmacyStock(@PathVariable Long id, Authentication authentication) {
        if (pharmacyStockService.deletePharmacyStock(id, authentication)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<List<PharmacyStockDto>> getPharmacyStockByPharmacyId(
            @PathVariable Long pharmacyId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(pharmacyStockService.getPharmacyStockByPharmacyId(pharmacyId, authentication));
    }

    @GetMapping("/drug/{drugId}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY','CLIENT')")
    public ResponseEntity<List<PharmacyStockDto>> getPharmacyStockByDrugId(
            @PathVariable Long drugId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(pharmacyStockService.getPharmacyStockByDrugId(drugId, authentication));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<DrugDto>> autocompleteDrugs(@RequestParam String name) {
        return ResponseEntity.ok(pharmacyStockService.autocompleteDrugs(name));
    }

    @GetMapping("/nearby/{drugId}")
    @PreAuthorize("hasAnyRole('CLIENT', 'PHARMACY', 'ADMIN')")
    public ResponseEntity<List<PharmacyStockDto>> getNearbyPharmacies(
            @PathVariable Long drugId,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            Authentication authentication
    ) {
        return ResponseEntity.ok(pharmacyStockService.getNearbyPharmaciesWithDrug(drugId, latitude, longitude, 5.0));
    }
}