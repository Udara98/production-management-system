package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QRequestGetDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class QuotationRequestService implements IQuotationRequestService {

    @Autowired
    private IPrivilegeService privilegeService;

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
    public ResponseEntity<?> AddNewQuotationRequest(Integer ingId, QRequestGetDTO request) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "QUOTATION_REQUEST");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("GRN Adds not Completed: You don't have permission!");
        }

        List<QuotationRequest> exQuotations = quotationRequestRepository.findByIngredientId(ingId);

        for (QuotationRequest qReq: exQuotations
             ) {
            if (qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Closed ||
                    qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Removed) {

                QuotationRequest quotationRequest = new QuotationRequest();
                quotationRequest.setIngredientId(ingId);
                quotationRequest.setRequestNo(QuotationRequest.generateUniqueId("QREQ-"));
                quotationRequest.setRequestDate(LocalDateTime.now());
                quotationRequest.setSuppliers(supplierIngredientService.GetSuppliersByIngredientId(ingId));
                quotationRequest.setAddedUser(auth.getName());
                quotationRequest.setAddedDate(LocalDateTime.now());

                // Set additional fields from QRequestGetDTO
                quotationRequest.setQuantity(request.getQuantity());
                quotationRequest.setRequiredDate(request.getRequiredDate());
                quotationRequest.setNote(request.getNote());


                // Save the quotation request
                quotationRequestRepository.save(quotationRequest);
                return ResponseEntity.ok("Quotation Request Sent");
            }
        }            return ResponseEntity.badRequest().body("Quotation Request Sent Already");


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
