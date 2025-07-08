package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QRequestGetDTO;
import com.AdwinsCom.AdwinsCom.DTO.QuotationRequestEmailDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
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

    @Autowired
    private EmailService emailService;

    final QuotationRequestRepository quotationRequestRepository;
    final SupplierRepository supplierRepository;
    final SupplierIngredientService supplierIngredientService;
    final IngredientRepository ingredientRepository;
    final SupplierQuotationTokenService supplierQuotationTokenService;
    public QuotationRequestService(QuotationRequestRepository quotationRequestRepository, SupplierRepository supplierRepository, SupplierIngredientService supplierIngredientService, IngredientRepository ingredientRepository, SupplierQuotationTokenService supplierQuotationTokenService) {
        this.quotationRequestRepository = quotationRequestRepository;
        this.supplierRepository = supplierRepository;
        this.supplierIngredientService = supplierIngredientService;
        this.ingredientRepository = ingredientRepository;
        this.supplierQuotationTokenService = supplierQuotationTokenService;
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

        for (QuotationRequest qReq : exQuotations) {
            if (qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send) {
                // If any request is in "Send" status, don't create a new request
                return ResponseEntity.badRequest().body("Cannot create a new request. A request is already in 'Send' status.");
            }
        }

        // At this point, all requests are either "Closed" or "Removed"

        // Create a new QuotationRequest object
        QuotationRequest quotationRequest = new QuotationRequest();
        quotationRequest.setIngredientId(ingId);
        quotationRequest.setRequestNo(QuotationRequest.generateUniqueId("QREQ-"));
        quotationRequest.setRequestDate(LocalDateTime.now());
        quotationRequest.setSuppliers(supplierIngredientService.GetSuppliersByIngredientId(ingId));
        quotationRequest.setAddedUser(auth.getName());
        quotationRequest.setAddedDate(LocalDateTime.now());
        quotationRequest.setUnitType(request.getUnitType());

        // Set additional fields from QRequestGetDTO
        quotationRequest.setQuantity(request.getQuantity());
        quotationRequest.setRequiredDeliveryDate(request.getRequiredDeliveryDate());
        quotationRequest.setNote(request.getNote());

        // Save the quotation request
        quotationRequestRepository.save(quotationRequest);

            // Build the email DTO
        Ingredient ingredient = ingredientRepository.findById(ingId).orElse(null);
        QuotationRequestEmailDTO emailDTO = new QuotationRequestEmailDTO();
        emailDTO.setIngredientId(ingId);
        emailDTO.setIngredientName(ingredient != null ? ingredient.getIngredientName() : "");
        emailDTO.setUnit(ingredient != null ? ingredient.getUnitType().toString() : "");
        emailDTO.setRequiredDeliveryDate(request.getRequiredDeliveryDate());
        emailDTO.setRequestNo(quotationRequest.getRequestNo());
        emailDTO.setQuantity(request.getQuantity());
        emailDTO.setNote(request.getNote());

        // Send emails
        sendQuotationRequestToAllSuppliers(emailDTO);   

        return ResponseEntity.ok("Quotation Request Created Successfully");

    }

    @Override
    public ResponseEntity<?> GetAllQuotationRequests() {

        List<QuotationRequest> quotationRequests = quotationRequestRepository.findAllByRequestStatusNotRemoved();
        List<QRequestGetDTO> requestGetDTOS = new ArrayList<>();

        for (QuotationRequest qr : quotationRequests) {
            Ingredient ingredient = ingredientRepository.findById(qr.getIngredientId()).orElse(null);
            QRequestGetDTO requestGetDTO = new QRequestGetDTO();
            requestGetDTO.setId(qr.getId());
            requestGetDTO.setRequestNo(qr.getRequestNo());
            requestGetDTO.setIngCode(ingredient != null ? ingredient.getIngredientCode() : null);
            requestGetDTO.setRequestDate(qr.getRequestDate());
            requestGetDTO.setSuppliers(qr.getSuppliers());
            requestGetDTO.setRequestStatus(qr.getRequestStatus());
            requestGetDTO.setRequiredDeliveryDate(qr.getRequiredDeliveryDate());
            requestGetDTO.setDeadline(qr.getDeadline());
            requestGetDTO.setQuantity(qr.getQuantity());
            requestGetDTO.setNote(qr.getNote());
            // Set ingredient name and unit for frontend
            requestGetDTO.setIngredientName(ingredient != null ? ingredient.getIngredientName() : null);
            requestGetDTO.setUnit(ingredient != null ? ingredient.getUnitType().toString() : null);
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

    @Override
    public ResponseEntity<?> sendQuotationRequestToAllSuppliers(QuotationRequestEmailDTO emailDTO) {
        // Fetch ingredient details if needed (for validation or extra info)
        // Ingredient ingredient = ingredientRepository.findById(emailDTO.getIngredientId()).orElse(null);
        // String ingredientName = ingredient != null ? ingredient.getIngredientName() : emailDTO.getIngredientName();
        // String unit = ingredient != null ? ingredient.getUnitType().toString() : emailDTO.getUnit();

        // Find all suppliers for the ingredient by ID
        List<Supplier> suppliers = supplierRepository.findSuppliersByIngredientId(emailDTO.getIngredientId());

        System.out.println("sendQuotationRequestToAllSuppliers called with: " + emailDTO);

        // For each supplier, generate a unique token and send an email
        for (Supplier supplier : suppliers) {
            String email = supplier.getEmail();
            // Generate a token valid for 7 days (customize as needed)
            var tokenObj = supplierQuotationTokenService.generateToken(email, emailDTO.getRequestNo(), 7);
            String token = tokenObj.getToken();
            String subject = "Quotation Request for " + emailDTO.getIngredientName();
            String link = "http://localhost:8080/supplier-quotation-form.html?token=" + token;
            String body = String.format(
                "Dear %s,\n\n" +
                "We request a quotation for the following ingredient/product:\n" +
                "Name: %s\n" +
                "Quantity: %s %s\n" +
                "Required Delivery Date: %s\n" +
                "Please submit your quotation here: %s\n\nThank you.",
                supplier.getSupplierName(),
                emailDTO.getIngredientName(),
                emailDTO.getQuantity(),
                emailDTO.getUnit(),
                emailDTO.getRequiredDeliveryDate(),
                link
            );
            emailService.sendEmail(email, subject, body);
        }
        return ResponseEntity.ok("Quotation request sent to all suppliers for this ingredient.");
    }
}
