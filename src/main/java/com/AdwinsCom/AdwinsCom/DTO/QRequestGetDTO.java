package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QRequestGetDTO {
    private String ingredientName; // Name of the ingredient
    private String unit; // Unit type of the ingredient
    private Integer id;
    private String requestNo;
    private String ingCode;
    private String unitType;
    private LocalDateTime requestDate;
    private List<String> suppliers;
    private QuotationRequest.QRequestStatus requestStatus;
    private LocalDate requiredDeliveryDate; // Date when the quantity is required
    private Double quantity; // Quantity requested
    private String note;
    private LocalDate deadline; // Deadline for the quotation request
}
