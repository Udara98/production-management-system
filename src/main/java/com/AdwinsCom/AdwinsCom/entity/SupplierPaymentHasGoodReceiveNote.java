package com.AdwinsCom.AdwinsCom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "supplier_payment_has_good_receive_note")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class SupplierPaymentHasGoodReceiveNote {

//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer id;

    @EmbeddedId
    private SupplierPaymentGoodReceiveNoteId id;

//    @ManyToOne
//    @JsonBackReference
////    @JoinColumn(name = "supplier_payment_supplier_id" ,referencedColumnName = "id")
//    private SupplierPayment supplierPayment;
    @ManyToOne
    @MapsId("supplierPaymentId")
    @JoinColumn(name = "supplier_payment_id")
    @JsonBackReference // Back side (ignored during serialization)
    private SupplierPayment supplierPayment;


//    @ManyToOne
//    @JsonManagedReference
//    @JoinColumn(name = "good_receive_note_id" ,referencedColumnName = "id")
//    private GoodReceiveNote goodReceiveNote;

    @ManyToOne
    @MapsId("goodReceiveNoteId")
    @JoinColumn(name = "good_receive_note_id")
    @JsonBackReference // Back side (ignored during serialization)
    private GoodReceiveNote goodReceiveNote;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "balance")
    private Double balance;


}


