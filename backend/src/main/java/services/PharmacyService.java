package services;

import dtos.PharmacyDto;
import entities.Pharmacy;
import entities.User;
import lombok.AllArgsConstructor;
import mappers.PharmacyMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import repositories.PharmacyRepository;
import repositories.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final UserRepository userRepository;
    private final PharmacyMapper pharmacyMapper;

    public List<PharmacyDto> getAllPharmacies() {
        return pharmacyRepository.findAll().stream()
                .map(pharmacyMapper::toPharmacyDto)
                .collect(Collectors.toList());
    }

    public Optional<PharmacyDto> updatePharmacy(Authentication authentication, PharmacyDto pharmacyDto) {
        Long userId = resolveUserId(authentication);
        
        return pharmacyRepository.findById(userId)
                .map(pharmacy -> {
                    if (pharmacyDto.getPharmacyName() != null) {
                        pharmacy.setPharmacyName(pharmacyDto.getPharmacyName());
                    }
                    if (pharmacyDto.getPhone() != null) {
                        pharmacy.setPhone(pharmacyDto.getPhone());
                    }
                    if (pharmacyDto.getAddress() != null) {
                        pharmacy.setAddress(pharmacyDto.getAddress());
                    }
                    if (pharmacyDto.getLatitude() != null) {
                        pharmacy.setLatitude(pharmacyDto.getLatitude());
                    }
                    if (pharmacyDto.getLongitude() != null) {
                        pharmacy.setLongitude(pharmacyDto.getLongitude());
                    }
                    if (pharmacyDto.getOperatingHours() != null) {
                        pharmacy.setOperatingHours(pharmacyDto.getOperatingHours());
                    }
                    pharmacy.setUpdatedAt(Instant.now());
                    Pharmacy saved = pharmacyRepository.save(pharmacy);

                    if (pharmacyDto.getEmail() != null && !pharmacyDto.getEmail().isBlank()) {
                        User user = userRepository.findById(userId).orElse(null);
                        if (user != null) {
                            user.setEmail(pharmacyDto.getEmail());
                            userRepository.save(user);
                        }
                    }

                    return pharmacyMapper.toPharmacyDto(saved);
                });
    }

    private Long resolveUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof String) {
            return Long.parseLong((String) principal);
        }
        throw new AccessDeniedException("Invalid authentication");
    }
}