package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentHasOrderDTO;
import com.AdwinsCom.AdwinsCom.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPaymentDTO {

    private Integer orderId;
    private String receiptNo;
    // For multi-order payments
    private java.util.List<CustomerPaymentHasOrderDTO> paymentDetails;
    private LocalDate paymentDate;
    private Double totalAmount;
    private Double paidAmount;
    // Must be set from frontend: Pending, Completed, OnHold, Canceled
    private CustomerPayment.PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal balance;
    private String transferid;
    private String note;

    // For receipt rendering
    private String customerName;
    private String customerMobile;
    private String customerAddress;

}
