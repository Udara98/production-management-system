package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IQuotationRequestService {

    ResponseEntity<?> AddNewQuotationRequest(Integer ingId, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllQuotationRequests();
    ResponseEntity<?> UpdateQuotationRequest(QuotationRequest quotationRequest);
    ResponseEntity<?> DeleteQuotationRequest(Integer id);

}
