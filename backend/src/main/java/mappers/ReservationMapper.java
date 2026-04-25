package mappers;

import dtos.ReservationDto;
import entities.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = "spring")
public interface ReservationMapper {
    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", source = "client.user.name")
    @Mapping(target = "pharmacyId", source = "pharmacy.id")
    @Mapping(target = "pharmacyName", source = "pharmacy.pharmacyName")
    @Mapping(target = "pharmacyLatitude", source = "pharmacy.latitude")
    @Mapping(target = "pharmacyLongitude", source = "pharmacy.longitude")
    ReservationDto toReservationDto(Reservation reservation);

    @Mapping(target = "drugId", source = "stock.drug.id")
    @Mapping(target = "drugName", source = "stock.drug.name")
    @Mapping(target = "priceAtReservation", source = "unitPrice")
    dtos.ReservationItemDto toReservationItemDto(entities.ReservationItem item);
}

