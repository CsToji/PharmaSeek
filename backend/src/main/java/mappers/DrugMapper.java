package mappers;

import dtos.DrugDto;
import entities.Drug;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface DrugMapper {
    DrugDto toDrugDto(Drug drug);
    Drug toDrug(DrugDto drugDto);
}