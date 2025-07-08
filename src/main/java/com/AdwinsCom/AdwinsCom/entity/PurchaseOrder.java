package com.AdwinsCom.AdwinsCom.entity;

import java.math.BigDecimal;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.AdwinsCom.AdwinsCom.DTO.PurchaseOrderDTO;
import jakarta.persistence.*;
import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Entity
@Table(name = "purchaseorder")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseOrder {
    public void ifPresent(Object o) {
    }

    public enum PurchaseOrderStatus {
        Pending,
        Completed,
        Canceled,
        Overdue,
        Removed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "purchase_order_no" , unique = true)
    @NotNull
    private String purchaseOrderNo;

    @Column(name = "quotation_no")
    @NotNull
    private String quotationNo;

    @Column(name = "ingredient_code")
    private String ingredientCode;

    @Column(name = "supplier_reg_no")
    private String supplierRegNo;

    @Column(name = "price_per_unit")
    private Double pricePerUnit;

    @Column(name = "qty")
    private Integer qty;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "proposed_delivery_date")
    private LocalDate proposedDeliveryDate;

    @Column(name = "ordered_date")
    private LocalDate orderedDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "purchase_order_status")
    @Enumerated(EnumType.STRING)
    private PurchaseOrderStatus purchaseOrderStatus = PurchaseOrderStatus.Pending;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public PurchaseOrder mapDTO(PurchaseOrder purchaseOrder, PurchaseOrderDTO orderDTO, String userName) throws NoSuchAlgorithmException {
        PurchaseOrder newPurchaseOrder = new PurchaseOrder();
        if(purchaseOrder != null){
            newPurchaseOrder=purchaseOrder;
            newPurchaseOrder.setUpdatedUser(userName);
            newPurchaseOrder.setUpdatedDate(LocalDateTime.now());
        }else{
            newPurchaseOrder.setPurchaseOrderNo(QuotationRequest.generateUniqueId("PO-"));
            newPurchaseOrder.setQuotationNo(orderDTO.getQuotationNo());
            newPurchaseOrder.setIngredientCode(orderDTO.getIngredientCode());
            newPurchaseOrder.setSupplierRegNo(orderDTO.getSupplierRegNo());
            newPurchaseOrder.setPricePerUnit(orderDTO.getPricePerUnit());
            newPurchaseOrder.setAddedUser(userName);
            newPurchaseOrder.setAddedDate(LocalDateTime.now());
        }

        newPurchaseOrder.setQty(orderDTO.getQty());
        newPurchaseOrder.setTotalPrice(orderDTO.getTotalPrice());
        newPurchaseOrder.setProposedDeliveryDate(orderDTO.getProposedDeliveryDate());
        newPurchaseOrder.setNotes(orderDTO.getNotes());
        newPurchaseOrder.setPurchaseOrderStatus(orderDTO.getPurchaseOrderStatus());

        return newPurchaseOrder;
    }

    public void setPurchaseOrderStatus(PurchaseOrderStatus purchaseOrderStatus) {
        this.purchaseOrderStatus = purchaseOrderStatus;
    }

}
