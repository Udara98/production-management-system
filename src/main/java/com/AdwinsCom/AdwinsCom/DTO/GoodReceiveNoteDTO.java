package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodReceiveNoteDTO {
    private Integer id;
    private String grnNo;
    private PurchaseOrder purchaseOrder;
    private Double totalAmount;
    private GoodReceiveNote.GRNStatus grnStatus;
    private LocalDate receivedDate;
}
