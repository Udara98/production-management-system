package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SupplierPaymentDTO {
    private GoodReceiveNote goodReceiveNote;
    private Double totalAmount;
    private Double totalPaymentAmount;
    private Double totalBalanceAmount;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
}
