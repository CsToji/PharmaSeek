package mappers;

import dtos.PharmacyStockDto;
import entities.PharmacyStock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface PharmacyStockMapper {
    @Mapping(target = "pharmacyId", source = "pharmacy.id")
    @Mapping(target = "drugId", source = "drug.id")
    @Mapping(target = "drugName", source = "drug.name")
    @Mapping(target = "pharmacyName", source = "pharmacy.pharmacyName")
    @Mapping(target = "pharmacyAddress", source = "pharmacy.address")
    @Mapping(target = "latitude", source = "pharmacy.latitude")
    @Mapping(target = "longitude", source = "pharmacy.longitude")
    PharmacyStockDto toPharmacyStockDto(PharmacyStock pharmacyStock);

    PharmacyStock toPharmacyStock(PharmacyStockDto pharmacyStockDto);
}