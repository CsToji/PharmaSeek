package dtos;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.Data;


@Data
public class DrugDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String manufacturer;
    private String barCode;
    @JsonSetter(nulls = Nulls.SKIP)
    private Boolean requiresPrescription = false;
}