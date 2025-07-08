package com.AdwinsCom.AdwinsCom.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "customer_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPayment {

    public enum PaymentStatus{
        Pending, Completed, OnHold, Canceled
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "receipt_no")
    private String receiptNo;

    @OneToMany(mappedBy = "customerPayment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private java.util.List<CustomerPaymentHasOrder> paymentDetails = new java.util.ArrayList<>();

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "balance")
    private BigDecimal balance;

    @Column(name = "paidamount")
    private BigDecimal payAmount;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(name = "transferid")
    private String transferid;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

}
