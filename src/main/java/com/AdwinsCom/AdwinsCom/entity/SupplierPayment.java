package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentHasGoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.GoodReceiveNoteRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierPaymentRepository;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
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
    private Double totalAmount;

    @Column(name = "total_payment_amount")
    private Double totalPaymentAmount;

    @Column(name = "total_balance_amount")
    private Double totalBalanceAmount;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_method")
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
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "supplierPayment", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<SupplierPaymentHasGoodReceiveNote> payments = new ArrayList<>();


    @Transactional
    public SupplierPayment mapDTO(SupplierPayment supplierPayment, SupplierPaymentDTO supplierPaymentDTO, String userName, GoodReceiveNoteRepository goodReceiveNoteRepository, SupplierPaymentRepository supplierPaymentRepository) throws NoSuchAlgorithmException {


        
        SupplierPayment newSupplierPayment = new SupplierPayment();

        // If supplierPayment exists, update it
        if(supplierPayment != null){
            newSupplierPayment = supplierPayment;
            newSupplierPayment.setUpdatedUser(userName);
            newSupplierPayment.setUpdatedDate(LocalDateTime.now());
        }else{
         // Create a new supplier payment with generated bill number
            newSupplierPayment.setBillNo(QuotationRequest.generateUniqueId("BILL-"));
            newSupplierPayment.setTotalAmount(supplierPaymentDTO.getTotalAmount());
            newSupplierPayment.setAddedUser(userName);
            newSupplierPayment.setAddedDate(LocalDateTime.now());
        }
//        newSupplierPayment.setGoodReceiveNote(supplierPaymentDTO.getGoodReceiveNote());
        newSupplierPayment.setPaymentDate(supplierPaymentDTO.getPaymentDate());
        newSupplierPayment.setTotalPaymentAmount(supplierPaymentDTO.getTotalPaymentAmount());
        newSupplierPayment.setTotalBalanceAmount(supplierPaymentDTO.getTotalBalanceAmount());
        newSupplierPayment.setPaymentMethod(supplierPaymentDTO.getPaymentMethod());

        // Directly set the supplier (assuming supplierId is always provided by the controller)
        Supplier supplier = new Supplier();
        supplier.setId(supplierPaymentDTO.getSupplierId());
        newSupplierPayment.setSupplier(supplier);

        // Set Payment Method
        PaymentMethodSup paymentMethodSup = new PaymentMethodSup();
        paymentMethodSup.setTransactionId(supplierPaymentDTO.getTransactionId());
        paymentMethodSup.setPaymentMethod(supplierPaymentDTO.getPaymentMethod());
        newSupplierPayment.setPaymentMethodSup(paymentMethodSup);

        // Save Supplier Payment first to generate the ID
        newSupplierPayment = supplierPaymentRepository.save(newSupplierPayment);


        // Handle SupplierPaymentHasGoodReceiveNote Mapping
        List<SupplierPaymentHasGoodReceiveNote> paymentDetails = new ArrayList<>();
        if (supplierPaymentDTO.getPaymentDetails() != null) {
            for (SupplierPaymentHasGoodReceiveNoteDTO detailDTO : supplierPaymentDTO.getPaymentDetails()) {
                SupplierPaymentHasGoodReceiveNote detail = new SupplierPaymentHasGoodReceiveNote();
                detail.setSupplierPayment(newSupplierPayment);

                // Set Good Receive Note
                GoodReceiveNote grn = goodReceiveNoteRepository.findById(detailDTO.getGoodReceiveNoteId())
                        .orElseThrow(() -> new EntityNotFoundException("GoodReceiveNote not found!"));
                detail.setGoodReceiveNote(grn);
//
////              3. Initialize composite key (if not auto-populated)
//                SupplierPaymentGoodReceiveNoteId id = new SupplierPaymentGoodReceiveNoteId();
//                id.setSupplierPaymentId(newSupplierPayment.getId()); // Requires saved supplierPayment
//                id.setGoodReceiveNoteId(grn.getId());
//                detail.setId(id); // Set the composite key

                // Initialize the composite key
                SupplierPaymentGoodReceiveNoteId id = new SupplierPaymentGoodReceiveNoteId();
                id.setSupplierPaymentId(newSupplierPayment.getId());  // Ensure supplierPayment is persisted
                id.setGoodReceiveNoteId(grn.getId());  // Use fetched GoodReceiveNote ID
                detail.setId(id);




                // Set Amount
                detail.setAmount(detailDTO.getAmount());

                //Set Blance
                detail.setBalance(detailDTO.getBalance());

                paymentDetails.add(detail);
            }
        }
        newSupplierPayment.setPayments(paymentDetails);
        return newSupplierPayment;

    }

}
