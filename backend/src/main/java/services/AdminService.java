package services;

import dtos.AdminStatsDto;
import dtos.DrugDto;
import dtos.PharmacyDto;
import dtos.ReservationDto;
import dtos.UserDto;
import entities.Pharmacy;
import entities.PharmacyApprovalStatus;
import entities.Reservation;
import entities.Roles;
import lombok.AllArgsConstructor;
import mappers.DrugMapper;
import mappers.PharmacyMapper;
import mappers.ReservationMapper;
import mappers.UserMapper;
import org.springframework.stereotype.Service;
import repositories.*;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PharmacyRepository pharmacyRepository;
    private final ReservationRepository reservationRepository;
    private final DrugRepository drugRepository;
    private final UserMapper userMapper;
    private final PharmacyMapper pharmacyMapper;
    private final ReservationMapper reservationMapper;
    private final DrugMapper drugMapper;

    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long totalPharmacies = pharmacyRepository.findByApprovalStatus(PharmacyApprovalStatus.APPROVED).size();
        long totalClients = userRepository.findByRole(Roles.CLIENT).size();
        long totalReservations = reservationRepository.count();
        long totalDrugs = drugRepository.count();
        long pendingPharmacyApprovals = pharmacyRepository.findByApprovalStatus(PharmacyApprovalStatus.PENDING).size();

        List<Reservation> allReservations = reservationRepository.findAll();
        long pendingReservations = allReservations.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long completedReservations = allReservations.stream().filter(r -> "DONE".equals(r.getStatus())).count();

        long rejectedPharmacies = pharmacyRepository.findByApprovalStatus(PharmacyApprovalStatus.REJECTED).size();

        BigDecimal totalRevenue = allReservations.stream()
                .filter(r -> "DONE".equals(r.getStatus()) && r.getTotalPrice() != null)
                .map(Reservation::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsDto(
                totalUsers,
                totalPharmacies,
                totalClients,
                totalReservations,
                totalDrugs,
                pendingPharmacyApprovals,
                pendingReservations,
                completedReservations,
                rejectedPharmacies,
                totalRevenue,
                0L,
                0L
        );
    }

    public List<PharmacyDto> getPendingPharmacies() {
        return pharmacyRepository.findByApprovalStatus(PharmacyApprovalStatus.PENDING).stream()
                .map(pharmacyMapper::toPharmacyDto)
                .toList();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserDto)
                .toList();
    }

    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(reservationMapper::toReservationDto)
                .toList();
    }

    public List<DrugDto> getAllDrugs() {
        return drugRepository.findAll().stream()
                .map(drugMapper::toDrugDto)
                .toList();
    }

    public List<PharmacyDto> getAllPharmacies() {
        return pharmacyRepository.findAll().stream()
                .map(pharmacyMapper::toPharmacyDto)
                .toList();
    }
}