package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchDTO {
    private Integer id;
    private Double totalQuantity;
    private Double availableQuantity;
    private String recipeCode;
    private String recipeName;
    private Double damagedQuantity;
    private LocalDateTime manufactureDate;
    private LocalDateTime expireDate;
    private Double totalCost;
    private Double totalSale;
    private Batch.BatchStatus batchStatus;
    private String note;
}
