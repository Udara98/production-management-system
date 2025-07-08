package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseOrderDTO {
    private String quotationNo;
    private String ingredientCode;
    private String supplierRegNo;
    private String unitType;
    private Double pricePerUnit;
    private Integer qty;
    private Double totalPrice;
    private LocalDate proposedDeliveryDate;
    private String notes;
    private PurchaseOrder.PurchaseOrderStatus purchaseOrderStatus;
}
