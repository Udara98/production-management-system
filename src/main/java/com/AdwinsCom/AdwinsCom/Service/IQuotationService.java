package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.entity.Quotation;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IQuotationService {

    ResponseEntity<?> AddNewQuotation(QuotationDTO quotationDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllQuotations();
    ResponseEntity<?> UpdateQuotation(QuotationDTO quotationDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> DeleteQuotation(Integer id);

}