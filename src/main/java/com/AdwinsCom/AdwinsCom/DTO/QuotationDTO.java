package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Quotation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class QuotationDTO {
    private Integer id;
    private String quotationRequestNo;
    private String ingredientCode;
    private String supplierRegNo;
    private Double pricePerUnit;
    private LocalDate receivedDate;
    private LocalDate deadline;
    private Quotation.QuotationStatus quotationStatus;
}
