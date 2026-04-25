package entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "pharmacy")
public class Pharmacy {
    @Id
    @Column(name = "id")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id")
    private User user;


    @Column(name = "pharmacy_name")
    private String pharmacyName;


    @Column(name = "tax_id")
    private String taxId;

    @Transient
    private String email;

    @Column(name = "address")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "latitude")
    private Double latitude;


    @Column(name = "longitude")
    private Double longitude;


    @Column(name = "schedule")
    private String schedule;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private PharmacyApprovalStatus approvalStatus;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}