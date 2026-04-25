package controllers;

import dtos.DrugDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import services.DrugService;

import java.util.List;

@RestController
@RequestMapping("/drugs")
@AllArgsConstructor
@Tag(name="Drugs")
public class DrugController {
    private final DrugService drugService;
    @GetMapping
    public ResponseEntity<List<DrugDto>> getAllDrugs() {
        return ResponseEntity.ok(drugService.getAllDrugs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DrugDto> getDrugById(@PathVariable Long id) {
        return drugService.getDrugById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<DrugDto> createDrug(@RequestBody DrugDto drugDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(drugService.createDrug(drugDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    public ResponseEntity<DrugDto> updateDrug(@PathVariable Long id, @RequestBody DrugDto drugDto) {
        return drugService.updateDrug(id, drugDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDrug(@PathVariable Long id) {
        if (drugService.deleteDrug(id)!=null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<DrugDto>> getDrugByName(@RequestParam String name) {
        return drugService.getDrugByName(name);
    }
}