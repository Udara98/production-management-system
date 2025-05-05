package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import org.springframework.http.ResponseEntity;

public interface IPaymentMethodSupRepository {
    ResponseEntity<?> createOrFetchPaymentMethod(SupplierPaymentDTO request);




}
