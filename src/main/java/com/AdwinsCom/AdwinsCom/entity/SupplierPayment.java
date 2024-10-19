package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_payment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "bill_no" , unique = true)
    @NotNull
    private String billNo;

    @OneToOne
    @JoinColumn(name = "grn_id" ,referencedColumnName = "id")
    private GoodReceiveNote goodReceiveNote;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "total_payment_amount")
    private Double totalPaymentAmount;

    @Column(name = "total_balance_amount")
    private Double totalBalanceAmount;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public SupplierPayment mapDTO(SupplierPayment supplierPayment, SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException {
        SupplierPayment newSupplierPayment = new SupplierPayment();
        if(supplierPayment != null){
            newSupplierPayment = supplierPayment;
            newSupplierPayment.setUpdatedUser(userName);
            newSupplierPayment.setUpdatedDate(LocalDateTime.now());
        }else{
            newSupplierPayment.setBillNo(QuotationRequest.generateUniqueId("BILL-"));
            newSupplierPayment.setTotalAmount(supplierPaymentDTO.getTotalAmount());
            newSupplierPayment.setAddedUser(userName);
            newSupplierPayment.setAddedDate(LocalDateTime.now());
        }
        newSupplierPayment.setGoodReceiveNote(supplierPaymentDTO.getGoodReceiveNote());
        newSupplierPayment.setPaymentDate(supplierPaymentDTO.getPaymentDate());
        newSupplierPayment.setTotalPaymentAmount(supplierPaymentDTO.getTotalPaymentAmount());
        newSupplierPayment.setTotalBalanceAmount(supplierPaymentDTO.getTotalBalanceAmount());
        newSupplierPayment.setPaymentMethod(supplierPaymentDTO.getPaymentMethod());

        return newSupplierPayment;

    }

}
