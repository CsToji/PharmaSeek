package dtos;

import lombok.Data;

@Data
public class CreateStockWithDrugRequest {
    private DrugDto drug;
    private PharmacyStockDto stock;
}