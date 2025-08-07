package com.AdwinsCom.AdwinsCom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientAvailabilityDTO {
    private String ingredientCode;
    private String ingredientName;
    private Boolean isAvailable;
    private Double requiredQty; 
    private String unitType; 


}
