package com.AdwinsCom.AdwinsCom.DTO;
import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierPaymentDTO {
    private Integer id;
    private Double totalAmount;
    private Double totalPaymentAmount;
    private Double totalBalanceAmount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private Integer supplierId;
    private Integer paymentMethodSupId;
    // List of Good Receive Notes with amount
    private List<SupplierPaymentHasGoodReceiveNoteDTO> paymentDetails;


}

