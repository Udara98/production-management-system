package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QRequestGetDTO {
    private Integer id;
    private String requestNo;
    private String ingCode;
    private LocalDateTime requestDate;
    private List<String> suppliers;
    private QuotationRequest.QRequestStatus requestStatus;
}
