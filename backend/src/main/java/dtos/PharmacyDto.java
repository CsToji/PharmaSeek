package dtos;

import entities.PharmacyApprovalStatus;
import lombok.Value;

@Value
public class PharmacyDto {
    Long id;
    String pharmacyName;
    String taxId;
    String email;
    String address;
    String phone;
    String operatingHours;
    Double latitude;
    Double longitude;
    PharmacyApprovalStatus approvalStatus;
}
