package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
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

    public GoodReceiveNote mapDTO(GoodReceiveNote goodReceiveNote, GoodReceiveNoteDTO goodReceiveNoteDTO, String userName) throws NoSuchAlgorithmException {
        GoodReceiveNote newGoodReceiveNote = new GoodReceiveNote();

        if (goodReceiveNote != null) {
            newGoodReceiveNote = goodReceiveNote;
            newGoodReceiveNote.setUpdatedUser(userName);
            newGoodReceiveNote.setUpdatedDate(LocalDateTime.now());
        } else {
            newGoodReceiveNote.setGrnNo(QuotationRequest.generateUniqueId("GRN-"));
            newGoodReceiveNote.setAddedUser(userName);
            newGoodReceiveNote.setAddedDate(LocalDateTime.now());
        }
        newGoodReceiveNote.setPurchaseOrder(goodReceiveNoteDTO.getPurchaseOrder());
        newGoodReceiveNote.setTotalAmount(goodReceiveNoteDTO.getTotalAmount());
        newGoodReceiveNote.setReceivedDate(goodReceiveNoteDTO.getReceivedDate());
        newGoodReceiveNote.setGrnStatus(goodReceiveNoteDTO.getGrnStatus());
        newGoodReceiveNote.setPaymentStatus(goodReceiveNoteDTO.getPaymentStatus());

        // Map new fields
        newGoodReceiveNote.setAcceptedQuantity(goodReceiveNoteDTO.getAcceptedQuantity());
        newGoodReceiveNote.setRejectedQuantity(goodReceiveNoteDTO.getRejectedQuantity());
        newGoodReceiveNote.setRejectReason(goodReceiveNoteDTO.getRejectReason());

        // Directly set the supplier (assuming supplierId is always provided by the controller)
        Supplier supplier = new Supplier();
        supplier.setId(goodReceiveNoteDTO.getSupplierId());
        newGoodReceiveNote.setSupplier(supplier);

        return newGoodReceiveNote;
    }

}
