package mappers;

import dtos.PharmacyDto;
import entities.Pharmacy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PharmacyMapper {
    @Mapping(target = "taxId", source = "taxId")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "operatingHours", source = "operatingHours")
    @Mapping(target = "latitude", source = "latitude")
    @Mapping(target = "longitude", source = "longitude")
    PharmacyDto toPharmacyDto(Pharmacy pharmacy);
}
