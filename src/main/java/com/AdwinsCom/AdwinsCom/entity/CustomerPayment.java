package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

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

    @Column(name = "invoice_no")
    private String invoiceNo;

    @OneToOne
    @JoinColumn(name = "order_id" ,referencedColumnName = "id")
    private CustomerOrder order;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public CustomerPayment mapDTO(CustomerPayment customerPayment, CustomerPaymentDTO customerPaymentDTO, String userName){
        CustomerPayment newCustomerPayment = new CustomerPayment();
        if (customerPayment!=null){
            newCustomerPayment = customerPayment;
            newCustomerPayment.setUpdatedUser(userName);
            newCustomerPayment.setUpdatedDate(LocalDateTime.now());
        }else {
            newCustomerPayment.setAddedUser(userName);
            newCustomerPayment.setAddedDate(LocalDateTime.now());
        }
        newCustomerPayment.setInvoiceNo(customerPaymentDTO.getInvoiceNo());
        newCustomerPayment.setOrder(customerPaymentDTO.getOrder());
        newCustomerPayment.setPaymentDate(customerPaymentDTO.getPaymentDate());
        newCustomerPayment.setTotalAmount(customerPaymentDTO.getTotalAmount());
        newCustomerPayment.setPaymentStatus(customerPaymentDTO.getPaymentStatus());
        newCustomerPayment.setPaymentMethod(customerPaymentDTO.getPaymentMethod());

        return newCustomerPayment;
    }
}
