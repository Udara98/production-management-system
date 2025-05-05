package com.AdwinsCom.AdwinsCom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProductRestockRequestDTO {
    private Integer productId;
    private Integer batchId;
    private Integer quantity;
    private Double salesPrice;
    private LocalDateTime expireDate;
}
