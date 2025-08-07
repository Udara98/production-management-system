package com.AdwinsCom.AdwinsCom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "total_amount")
    @NotNull
    private Double totalAmount;

    @Column(name = "total_payment_amount")
    @NotNull
    private Double totalPaymentAmount;

    @Column(name = "payment_date")
    @NotNull
    private LocalDate paymentDate;

    @Column(name = "payment_method")
    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @ManyToOne(cascade = CascadeType.ALL)
    @JsonManagedReference
    @JoinColumn(name = "payment_method_id" ,referencedColumnName = "id")
    private PaymentMethodSup paymentMethodSup;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    @NotNull
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "supplierPayment", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<SupplierPaymentHasGoodReceiveNote> payments = new ArrayList<>();


}
