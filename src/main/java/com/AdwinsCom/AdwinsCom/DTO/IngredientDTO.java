package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngredientDTO {
    private Integer id;
    private String ingredientCode;
    private String ingredientName;
    private String note;
    private Double quantity;
    private Ingredient.UnitType unitType;
    private Integer rop;
    private Integer roq;
    private Double avgCost;
}