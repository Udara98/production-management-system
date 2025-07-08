package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierQuotationDTO;
import com.AdwinsCom.AdwinsCom.entity.Quotation;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IQuotationService {

    ResponseEntity<?> AddNewQuotation(QuotationDTO quotationDTO) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllQuotations();
    ResponseEntity<?> UpdateQuotation(QuotationDTO quotationDTO) throws NoSuchAlgorithmException;
    ResponseEntity<?> DeleteQuotation(Integer id);
    void saveSupplierQuotation(SupplierQuotationDTO supplierQuotationDTO, String requestNo, String supplierEmail);

}
