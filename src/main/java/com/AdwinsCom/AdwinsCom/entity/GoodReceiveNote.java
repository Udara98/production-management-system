package com.AdwinsCom.AdwinsCom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "good_receive_note")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodReceiveNote {

    public enum GRNStatus {
        Pending, Approved, Rejected, Closed, Removed
    }

    public enum PaymentStatus {
        Pending, Partially_Paid, Paid
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "grn_no")
    private String grnNo;

    @OneToOne
    @JoinColumn(name = "purchase_order_id", referencedColumnName = "id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "accepted_quantity")
    private Integer acceptedQuantity;

    @Column(name = "rejected_quantity")
    private Integer rejectedQuantity;

    @Column(name = "reject_reason", length = 255)
    private String rejectReason;

    @Column(name = "grn_status")
    @Enumerated(EnumType.STRING)
    private GRNStatus grnStatus;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "balance")
    private Double balance;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @OneToMany(mappedBy = "goodReceiveNote", cascade = CascadeType.ALL)
    @JsonBackReference
    private List<SupplierPaymentHasGoodReceiveNote> payments = new ArrayList<>();


}
