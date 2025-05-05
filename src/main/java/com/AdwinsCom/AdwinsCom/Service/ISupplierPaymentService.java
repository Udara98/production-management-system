package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface ISupplierPaymentService {

    ResponseEntity<?> AddNewSupplierPayment(SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllSupplierPayment();
    ResponseEntity<?> DeleteSupplierPayment(Integer id);
    ResponseEntity<?> CreateOrFetchPaymentMethod(SupplierPaymentDTO request);
}
