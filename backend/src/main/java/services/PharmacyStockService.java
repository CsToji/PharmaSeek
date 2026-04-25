package services;

import dtos.DrugDto;
import dtos.PharmacyStockDto;
import entities.Drug;
import entities.Pharmacy;
import entities.PharmacyStock;
import entities.Reservation;
import entities.ReservationItem;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import mappers.DrugMapper;
import mappers.PharmacyStockMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repositories.DrugRepository;
import repositories.PharmacyRepository;
import repositories.PharmacyStockRepository;
import repositories.ReservationItemRepository;
import repositories.ReservationRepository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PharmacyStockService {

    private final PharmacyStockRepository pharmacyStockRepository;
    private final PharmacyRepository pharmacyRepository;
    private final DrugRepository drugRepository;
    private final PharmacyStockMapper pharmacyStockMapper;
    private final DrugMapper drugMapper;
    private final ReservationItemRepository reservationItemRepository;
    private final ReservationRepository reservationRepository;
    private final EntityManager entityManager;

    public List<PharmacyStockDto> getAllPharmacyStock() {
        return pharmacyStockRepository.findAll().stream()
                .map(pharmacyStockMapper::toPharmacyStockDto)
                .collect(Collectors.toList());
    }

    public Optional<PharmacyStockDto> getPharmacyStockById(Long id, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);

        return pharmacyStockRepository.findById(id)
                .map(stock -> {
                    if (!admin && !stock.getPharmacy().getId().equals(authenticatedUserId)) {
                        throw new AccessDeniedException("You can only view stock lines for your own pharmacy.");
                    }
                    return pharmacyStockMapper.toPharmacyStockDto(stock);
                });
    }

    public PharmacyStockDto createPharmacyStock(PharmacyStockDto pharmacyStockDto, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);

        if (!admin) {
            if (pharmacyStockDto.getPharmacyId() == null) {
                pharmacyStockDto.setPharmacyId(authenticatedUserId);
            } else if (!pharmacyStockDto.getPharmacyId().equals(authenticatedUserId)) {
                throw new AccessDeniedException("You can only create stock lines for your own pharmacy.");
            }
        }

        if (pharmacyStockDto.getPharmacyId() == null) {
            throw new IllegalArgumentException("pharmacyId is required.");
        }
        if (pharmacyStockDto.getDrugId() == null) {
            throw new IllegalArgumentException("drugId is required.");
        }

        pharmacyStockRepository.findByPharmacyIdAndDrugId(pharmacyStockDto.getPharmacyId(), pharmacyStockDto.getDrugId())
                .ifPresent(existing -> {
                    throw new IllegalStateException(
                            "Stock already exists for pharmacyId=" + pharmacyStockDto.getPharmacyId()
                                    + " and drugId=" + pharmacyStockDto.getDrugId()
                                    + ". Use update endpoint instead."
                    );
                });

        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyStockDto.getPharmacyId())
                .orElseThrow(() -> new IllegalArgumentException("Pharmacy with ID " + pharmacyStockDto.getPharmacyId() + " not found."));
        Drug drug = drugRepository.findById(pharmacyStockDto.getDrugId())
                .orElseThrow(() -> new IllegalArgumentException("Drug with ID " + pharmacyStockDto.getDrugId() + " not found."));

        PharmacyStock pharmacyStock = pharmacyStockMapper.toPharmacyStock(pharmacyStockDto);
        pharmacyStock.setPharmacy(pharmacy);
        pharmacyStock.setDrug(drug);
        pharmacyStock.setCreatedAt(Instant.now());
        pharmacyStock.setUpdatedAt(Instant.now());
        PharmacyStock savedPharmacyStock = pharmacyStockRepository.save(pharmacyStock);
        return pharmacyStockMapper.toPharmacyStockDto(savedPharmacyStock);
    }

    public PharmacyStockDto createPharmacyStockWithNewDrug(PharmacyStockDto pharmacyStockDto, DrugDto drugDto, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);

        Long pharmacyId = admin && pharmacyStockDto.getPharmacyId() != null
                ? pharmacyStockDto.getPharmacyId()
                : authenticatedUserId;

        Drug drug = drugMapper.toDrug(drugDto);
        drug.setCreatedAt(Instant.now());
        drug.setUpdatedAt(Instant.now());
        if (drug.getRequiresPrescription() == null) {
            drug.setRequiresPrescription(false);
        }
        Drug savedDrug = drugRepository.save(drug);

        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new IllegalArgumentException("Pharmacy with ID " + pharmacyId + " not found."));

        PharmacyStock pharmacyStock = pharmacyStockMapper.toPharmacyStock(pharmacyStockDto);
        pharmacyStock.setPharmacy(pharmacy);
        pharmacyStock.setDrug(savedDrug);
        pharmacyStock.setCreatedAt(Instant.now());
        pharmacyStock.setUpdatedAt(Instant.now());
        PharmacyStock savedPharmacyStock = pharmacyStockRepository.save(pharmacyStock);
        return pharmacyStockMapper.toPharmacyStockDto(savedPharmacyStock);
    }

    public Optional<PharmacyStockDto> updatePharmacyStock(Long id, PharmacyStockDto pharmacyStockDto, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);

        return pharmacyStockRepository.findById(id)
                .map(existingStock -> {
                    if (!admin && !existingStock.getPharmacy().getId().equals(authenticatedUserId)) {
                        throw new AccessDeniedException("You can only update stock lines for your own pharmacy.");
                    }

                    Long targetPharmacyId = pharmacyStockDto.getPharmacyId() != null
                            ? pharmacyStockDto.getPharmacyId()
                            : existingStock.getPharmacy().getId();

                    if (!admin && !targetPharmacyId.equals(authenticatedUserId)) {
                        throw new AccessDeniedException("You can only update stock lines for your own pharmacy.");
                    }

                    Long targetDrugId = pharmacyStockDto.getDrugId() != null
                            ? pharmacyStockDto.getDrugId()
                            : existingStock.getDrug().getId();

                    pharmacyStockRepository.findByPharmacyIdAndDrugId(targetPharmacyId, targetDrugId)
                            .ifPresent(duplicate -> {
                                if (!duplicate.getId().equals(id)) {
                                    throw new IllegalStateException(
                                            "Stock already exists for pharmacyId=" + targetPharmacyId
                                                    + " and drugId=" + targetDrugId
                                    );
                                }
                            });

                    Pharmacy pharmacy = pharmacyRepository.findById(targetPharmacyId)
                            .orElseThrow(() -> new IllegalArgumentException("Pharmacy with ID " + targetPharmacyId + " not found."));
                    Drug drug = drugRepository.findById(targetDrugId)
                            .orElseThrow(() -> new IllegalArgumentException("Drug with ID " + targetDrugId + " not found."));

                    existingStock.setPharmacy(pharmacy);
                    existingStock.setDrug(drug);

                    if (pharmacyStockDto.getQuantity() != null) {
                        existingStock.setQuantity(pharmacyStockDto.getQuantity());
                    }
                    if (pharmacyStockDto.getPrice() != null) {
                        existingStock.setPrice(pharmacyStockDto.getPrice());
                    }
                    if (pharmacyStockDto.getReservationDelayMinutes() != null) {
                        existingStock.setReservationDelayMinutes(pharmacyStockDto.getReservationDelayMinutes());
                    }

                    existingStock.setUpdatedAt(Instant.now());
                    PharmacyStock updatedStock = pharmacyStockRepository.save(existingStock);
                    return pharmacyStockMapper.toPharmacyStockDto(updatedStock);
                });
    }

    @Transactional
    public boolean deletePharmacyStock(Long id, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);

        Optional<PharmacyStock> stockOptional = pharmacyStockRepository.findById(id);
        if (stockOptional.isEmpty()) {
            return false;
        }

        PharmacyStock stock = stockOptional.get();
        if (!admin && !stock.getPharmacy().getId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("You can only delete stock lines for your own pharmacy.");
        }

        entityManager.createNativeQuery(
            "UPDATE reservation SET status = 'CANCELLED', updated_at = NOW() " +
            "WHERE id IN (SELECT reservation_id FROM reservation_item WHERE stock_id = ?) " +
            "AND status IN ('PENDING', 'CONFIRMED')"
        ).setParameter(1, id).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM reservation_item WHERE stock_id = ?")
            .setParameter(1, id).executeUpdate();

        pharmacyStockRepository.deleteById(id);
        return true;
    }

    public List<PharmacyStockDto> getPharmacyStockByPharmacyId(Long pharmacyId, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);
        if (pharmacyRepository.findById(pharmacyId).isEmpty()) {
            throw new IllegalArgumentException("Pharmacy with ID " + pharmacyId + " not found.");
        }
        if (!admin && !pharmacyId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("You can only view stock lines for your own pharmacy.");
        }

        return pharmacyStockRepository.findByPharmacyId(pharmacyId).stream()
                .map(pharmacyStockMapper::toPharmacyStockDto)
                .collect(Collectors.toList());
    }

    public List<PharmacyStockDto> getPharmacyStockByDrugId(Long drugId, Authentication authentication) {
        Long authenticatedUserId = extractAuthenticatedUserId(authentication);
        boolean admin = isAdmin(authentication);
        boolean client = isClient(authentication);
        if (drugRepository.findById(drugId).isEmpty()) {
            throw new IllegalArgumentException("Drug with ID " + drugId + " not found.");
        }
        if (admin || client) {
            return pharmacyStockRepository.findByDrugId(drugId).stream()
                    .map(pharmacyStockMapper::toPharmacyStockDto)
                    .collect(Collectors.toList());
        }

        return pharmacyStockRepository.findByPharmacyIdAndDrugId(authenticatedUserId, drugId)
                .map(stock -> List.of(pharmacyStockMapper.toPharmacyStockDto(stock)))
                .orElse(Collections.emptyList());
    }

    public List<DrugDto> autocompleteDrugs(String name) {
        return pharmacyStockRepository.findByDrugNameContainingIgnoreCase(name).stream()
                .map(stock -> drugMapper.toDrugDto(stock.getDrug()))
                .distinct()
                .collect(Collectors.toList());
    }

    public List<PharmacyStockDto> getMyPharmacyStock(Authentication authentication) {
        Long pharmacyId = extractAuthenticatedUserId(authentication);
        return getPharmacyStockByPharmacyId(pharmacyId, authentication);
    }

    public List<PharmacyStockDto> getNearbyPharmaciesWithDrug(Long drugId, Double userLat, Double userLng, double radiusKm) {
        if (userLat == null || userLng == null) {
            return pharmacyStockRepository.findByDrugId(drugId).stream()
                    .map(pharmacyStockMapper::toPharmacyStockDto)
                    .collect(Collectors.toList());
        }
        
        return pharmacyStockRepository.findByDrugId(drugId).stream()
                .map(pharmacyStockMapper::toPharmacyStockDto)
                .filter(dto -> dto.getLatitude() != null && dto.getLongitude() != null)
                .filter(dto -> calculateDistance(userLat, userLng, dto.getLatitude(), dto.getLongitude()) <= radiusKm)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private Long extractAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AccessDeniedException("Unauthenticated request.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException ignored) {
                throw new AccessDeniedException("Invalid authentication principal.");
            }
        }

        throw new AccessDeniedException("Invalid authentication principal.");
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private boolean isClient(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_CLIENT"::equals);
    }
}

