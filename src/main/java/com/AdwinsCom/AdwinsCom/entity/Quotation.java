package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quotation {

    public enum QuotationStatus {
        Pending,
        Accepted,
        Rejected,
        Closed,
        Removed
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "quotation_no")
    private String quotationNo;

    @Column(name = "ingredient_code")
    private String ingredientCode;

    @Column(name = "quotation_request_no")
    private String quotationRequestNo;

    @Column(name = "supplier_reg_no")
    private String supplierRegNo;

    @Column(name = "price_per_unit")
    private Double pricePerUnit;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "unit_type")
    private String unitType;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "proposed_delivery_date")
    private LocalDate proposedDeliveryDate;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "quotation_status")
    @Enumerated(EnumType.STRING)
    private QuotationStatus quotationStatus = QuotationStatus.Pending;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public Quotation mapDTO(Quotation quotation, QuotationDTO quotationDTO, String userName) throws NoSuchAlgorithmException {
        Quotation newQuotation = new Quotation();
        if(quotation != null){
            newQuotation = quotation;
            newQuotation.setUpdatedUser(userName);
            newQuotation.setUpdatedDate(LocalDateTime.now());
        }else {
            newQuotation.setQuotationRequestNo(quotationDTO.getQuotationRequestNo());
            newQuotation.setIngredientCode(quotationDTO.getIngredientCode());
            newQuotation.setSupplierRegNo(quotationDTO.getSupplierRegNo());
            newQuotation.setQuotationNo(QuotationRequest.generateUniqueId("QNO-"));
            newQuotation.setAddedUser(userName);
            newQuotation.setAddedDate(LocalDateTime.now());
        }

        newQuotation.setPricePerUnit(quotationDTO.getPricePerUnit());
        newQuotation.setReceivedDate(quotationDTO.getReceivedDate());
        newQuotation.setQuotationStatus(quotationDTO.getQuotationStatus());
        newQuotation.setQuantity(quotationDTO.getQuantity());
        newQuotation.setUnitType(quotationDTO.getUnitType());
        newQuotation.setTotalPrice(quotationDTO.getTotalPrice());

        return newQuotation;
    }

}
