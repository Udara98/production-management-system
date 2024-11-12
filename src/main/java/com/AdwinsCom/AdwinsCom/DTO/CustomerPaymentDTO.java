package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import com.AdwinsCom.AdwinsCom.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPaymentDTO {
    private String invoiceNo;
    private CustomerOrder order;
    private LocalDate paymentDate;
    private Double totalAmount;
    private CustomerPayment.PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal payAmount;
    private BigDecimal balance;
    private String transferid;
    private String note;

}
