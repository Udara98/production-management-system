package com.AdwinsCom.AdwinsCom.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    private String receiptNo;

    @OneToMany(mappedBy = "customerPayment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private java.util.List<CustomerPaymentHasOrder> paymentDetails = new java.util.ArrayList<>();

    @Column(name = "payment_date")
    @NotNull
    private LocalDate paymentDate;

    @Column(name = "balance")
    @NotNull
    private BigDecimal balance;

    @Column(name = "paidamount")
    @NotNull
    private BigDecimal payAmount;

    @Column(name = "payment_status")
    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method")
    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;


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

}
