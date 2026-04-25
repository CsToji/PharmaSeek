package services;

import dtos.DrugDto;
import entities.Drug;
import lombok.AllArgsConstructor;
import mappers.DrugMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import repositories.DrugRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class DrugService {
    private final DrugRepository drugRepository;
    private final DrugMapper drugMapper;

    public List<DrugDto> getAllDrugs() {
        return drugRepository.findAll().stream()
                .map(drugMapper::toDrugDto)
                .collect(Collectors.toList());
    }

    public Optional<DrugDto> getDrugById(Long id) {
        return drugRepository.findById(id)
                .map(drugMapper::toDrugDto);
    }

    public DrugDto createDrug(DrugDto drugDto) {
        Drug drug = drugMapper.toDrug(drugDto);
        drug.setCreatedAt(Instant.now());
        drug.setUpdatedAt(Instant.now());
        if (drugDto.getRequiresPrescription() == null) {
            drug.setRequiresPrescription(false);
        }
        Drug savedDrug = drugRepository.save(drug);
        return drugMapper.toDrugDto(savedDrug);
    }

    public Optional<DrugDto> updateDrug(Long id, DrugDto drugDto) {
        return drugRepository.findById(id)
                .map(existingDrug -> {
                    existingDrug.setName(drugDto.getName());
                    existingDrug.setDescription(drugDto.getDescription());
                    existingDrug.setCategory(drugDto.getCategory());
                    existingDrug.setManufacturer(drugDto.getManufacturer());
                    existingDrug.setBarCode(drugDto.getBarCode());
                    existingDrug.setRequiresPrescription(drugDto.getRequiresPrescription());
                    existingDrug.setUpdatedAt(Instant.now());
                    Drug updatedDrug = drugRepository.save(existingDrug);
                    return drugMapper.toDrugDto(updatedDrug);
                });
    }

    public ResponseEntity<DrugDto> deleteDrug(Long id) {
        if (drugRepository.existsById(id)) {
            drugRepository.deleteById(id);
            return ResponseEntity.status(202).build();
        }
        return ResponseEntity.notFound().build();
    }
    public ResponseEntity<List<DrugDto>> getDrugByName(String name) {
        List<DrugDto> drugs = drugRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(drugMapper::toDrugDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(drugs);
    }

}