package dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalPharmacies;
    private long totalClients;
    private long totalReservations;
    private long totalDrugs;
    private long pendingPharmacyApprovals;
    private long pendingReservations;
    private long completedReservations;
    private long rejectedPharmacies;
    private BigDecimal totalRevenue;
    private long newUsersThisMonth;
    private long newReservationsThisMonth;
}