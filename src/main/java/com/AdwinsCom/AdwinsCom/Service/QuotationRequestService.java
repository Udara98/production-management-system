package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QRequestGetDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuotationRequestService implements IQuotationRequestService {

    final QuotationRequestRepository quotationRequestRepository;
    final SupplierRepository supplierRepository;
    final SupplierIngredientService supplierIngredientService;
    final IngredientRepository ingredientRepository;
    public QuotationRequestService(QuotationRequestRepository quotationRequestRepository, SupplierRepository supplierRepository, SupplierIngredientService supplierIngredientService, IngredientRepository ingredientRepository) {
        this.quotationRequestRepository = quotationRequestRepository;
        this.supplierRepository = supplierRepository;
        this.supplierIngredientService = supplierIngredientService;
        this.ingredientRepository = ingredientRepository;
    }

    @Override
    public ResponseEntity<?> AddNewQuotationRequest(Integer ingId, String userName) throws NoSuchAlgorithmException {

        List<QuotationRequest> exQuotations = quotationRequestRepository.findByIngredientId(ingId);

        for (QuotationRequest qReq: exQuotations
             ) {
            if (qReq.getRequestStatus() != QuotationRequest.QRequestStatus.Closed) {
                return ResponseEntity.badRequest().body("Quotation Request Sent Already");
            }
        }
        QuotationRequest quotationRequest = new QuotationRequest();
        quotationRequest.setIngredientId(ingId);
        quotationRequest.setRequestNo(QuotationRequest.generateUniqueId("QREQ-"));
        quotationRequest.setRequestDate(LocalDateTime.now());
        quotationRequest.setSuppliers(supplierIngredientService.GetSuppliersByIngredientId(ingId));
        quotationRequest.setAddedUser(userName);
        quotationRequest.setAddedDate(LocalDateTime.now());

        quotationRequestRepository.save(quotationRequest);
        return ResponseEntity.ok("Quotation Request Sent");
    }

    @Override
    public ResponseEntity<?> GetAllQuotationRequests() {

        List<QuotationRequest> quotationRequests = quotationRequestRepository.findAllByRequestStatusNotRemoved();
        List<QRequestGetDTO> requestGetDTOS = new ArrayList<>();

        for (QuotationRequest qr: quotationRequests
             ) {
            Ingredient ingredient = ingredientRepository.findById(qr.getIngredientId()).get();
            QRequestGetDTO requestGetDTO = new QRequestGetDTO();
            requestGetDTO.setId(qr.getId());
            requestGetDTO.setRequestNo(qr.getRequestNo());
            requestGetDTO.setIngCode(ingredient.getIngredientCode());
            requestGetDTO.setRequestDate(qr.getRequestDate());
            requestGetDTO.setSuppliers(qr.getSuppliers());
            requestGetDTO.setRequestStatus(qr.getRequestStatus());

            requestGetDTOS.add(requestGetDTO);
        }

        return ResponseEntity.ok(requestGetDTOS);
    }

    @Override
    public ResponseEntity<?> UpdateQuotationRequest(QuotationRequest quotationRequest) {
        return null;
    }

    @Override
    public ResponseEntity<?> DeleteQuotationRequest(Integer id) {
        QuotationRequest quotationRequest = quotationRequestRepository.findById(id).get();
        if(quotationRequest.getRequestStatus() == QuotationRequest.QRequestStatus.Send){
            return ResponseEntity.badRequest().body("Can't Delete Active Quotation Request");
        }
        quotationRequest.setRequestStatus(QuotationRequest.QRequestStatus.Removed);
        quotationRequestRepository.save(quotationRequest);
        return ResponseEntity.ok("Quotation Request Deleted");
    }
}
