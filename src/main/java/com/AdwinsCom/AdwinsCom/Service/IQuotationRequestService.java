package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QRequestGetDTO;
import com.AdwinsCom.AdwinsCom.DTO.QuotationRequestEmailDTO;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IQuotationRequestService {

    ResponseEntity<?> AddNewQuotationRequest(Integer ingId, QRequestGetDTO request) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllQuotationRequests();
    ResponseEntity<?> findQuotationRequestByStatusNotRemoved();
    ResponseEntity<?> UpdateQuotationRequest(QuotationRequest quotationRequest);
    ResponseEntity<?> DeleteQuotationRequest(Integer id);
    ResponseEntity<?> sendQuotationRequestToAllSuppliers(QuotationRequestEmailDTO emailDTO);
    ResponseEntity<?> GetAllSendQuotationRequests();

}
