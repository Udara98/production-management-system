package com.AdwinsCom.AdwinsCom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierPaymentHasGoodReceiveNoteDTO {
    private Integer supplierPaymentId;
    private Integer goodReceiveNoteId;
    private Double amount;
    private Double balance;
}
