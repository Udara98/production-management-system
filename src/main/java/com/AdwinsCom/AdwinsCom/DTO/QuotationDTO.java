package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Quotation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuotationDTO {
    private Integer id;
    private String quotationNo;
    private String quotationRequestNo;
    private String ingredientCode;
    private String supplierRegNo;
    private Double pricePerUnit;
    private LocalDate receivedDate;
    private Quotation.QuotationStatus quotationStatus;
    private Double quantity;
    private String unitType;
    private Double totalPrice;
    private LocalDate proposedDeliveryDate;
}
