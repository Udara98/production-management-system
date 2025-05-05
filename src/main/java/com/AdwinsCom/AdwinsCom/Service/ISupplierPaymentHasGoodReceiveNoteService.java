package com.AdwinsCom.AdwinsCom.Service;

import org.springframework.http.ResponseEntity;

public interface ISupplierPaymentHasGoodReceiveNoteService {

    ResponseEntity<?> findGrnNumbersBySupplierPaymentId(Integer supplierPaymentId);
}
