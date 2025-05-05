package com.AdwinsCom.AdwinsCom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "payment_method")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PaymentMethodSup {

    @Column(name = "id", unique = true)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_id")
    private String transactionId;

    @OneToMany(mappedBy = "paymentMethod")
    @JsonBackReference  // This side of the relationship is not serialized
    private List<SupplierPayment> supplierPayments;

    // Custom constructor to match your usage
    public PaymentMethodSup(PaymentMethod paymentMethod, String transactionId) {
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
    }


}
