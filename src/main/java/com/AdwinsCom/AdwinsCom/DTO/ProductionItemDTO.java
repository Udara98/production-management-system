package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductionItemDTO {
    private Integer id;
    private String productionItemName;
    private String flavourId;
    private String packageTypeId;
    private String recipeCode;
    private ProductionItem.ProductionItemStatus status;
}
