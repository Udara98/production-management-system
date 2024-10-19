package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "good_receive_note")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodReceiveNote {

    public enum GRNStatus {
        Pending, Approved, Rejected, Closed, Removed
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

    @Column(name = "grn_status")
    @Enumerated(EnumType.STRING)
    private GRNStatus grnStatus;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

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

        return newGoodReceiveNote;

    }

}
