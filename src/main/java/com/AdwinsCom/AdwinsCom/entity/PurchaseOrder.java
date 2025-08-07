package com.AdwinsCom.AdwinsCom.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    @NotNull
    private String ingredientCode;

    @Column(name = "supplier_reg_no")
    @NotNull
    private String supplierRegNo;

    @Column(name = "price_per_unit")
    @NotNull
    private Double pricePerUnit;

    @Column(name = "qty")
    @NotNull
    private Integer qty;

    @Column(name = "total_price")
    @NotNull
    private Double totalPrice;

    @Column(name = "proposed_delivery_date")
    @NotNull
    private LocalDate proposedDeliveryDate;

    @Column(name = "ordered_date")
    @NotNull
    private LocalDateTime orderedDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "purchase_order_status")
    @Enumerated(EnumType.STRING)
    private PurchaseOrderStatus purchaseOrderStatus = PurchaseOrderStatus.Pending;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    @NotNull
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;


    public void setPurchaseOrderStatus(PurchaseOrderStatus purchaseOrderStatus) {
        this.purchaseOrderStatus = purchaseOrderStatus;
    }

}
