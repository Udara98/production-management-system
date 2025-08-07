package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierQuotationDTO;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.entity.Quotation;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@Service
public class QuotationService implements IQuotationService {

    final QuotationRepository quotationRepository;
    final QuotationRequestRepository quotationRequestRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public QuotationService(QuotationRepository quotationRepository,QuotationRequestRepository quotationRequestRepository) {
        this.quotationRepository = quotationRepository;
        this.quotationRequestRepository = quotationRequestRepository;
    }


    private String getMaxQuotationNo() {
        
        String maxQuotationNo = quotationRepository.getMaxQuotationNo();
        int maxNumber = 1;

        if(maxQuotationNo != null && maxQuotationNo.startsWith("QNO-")) {
            maxNumber = Integer.parseInt(maxQuotationNo.substring(4)) +1 ;
        }

        return String.format("QNO-%04d", maxNumber);
    }

    @Override
    public ResponseEntity<?> AddNewQuotation(QuotationDTO quotationDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "QUOTATION");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Quotation Adds not Completed: You don't have permission!");
        }

        Quotation exQuotation = quotationRepository.findByQuotationRequestNoAndSupplierRegNo(quotationDTO.getQuotationRequestNo(), quotationDTO.getSupplierRegNo());
        if (exQuotation != null && exQuotation.getQuotationStatus() != Quotation.QuotationStatus.Closed ) {
            return ResponseEntity.badRequest().body("There is an existing Quotation for these Quotation Request and Supplier");
        }
        // Set quantity and unitType from the DTO, or fetch from QuotationRequest if not provided
        Double quantity = quotationDTO.getQuantity();
        String unitType = quotationDTO.getUnitType();
        if (quantity == null || quantity <= 0 || unitType == null || unitType.trim().isEmpty()) {
            // Fetch from QuotationRequest if missing
            QuotationRequest req = quotationRequestRepository.findByRequestNo(quotationDTO.getQuotationRequestNo());
            if (req != null) {
                if (quantity == null || quantity <= 0) quantity = req.getQuantity();
                if (unitType == null || unitType.trim().isEmpty()) unitType = req.getUnitType();
            }
        }
        if (quantity == null || quantity <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be provided and greater than 0 (either in form or request)");
        }
        if (unitType == null || unitType.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Unit Type must be provided (either in form or request)");
        }
        // Calculate totalPrice
        Double pricePerUnit = quotationDTO.getPricePerUnit() != null ? quotationDTO.getPricePerUnit() : 0.0;
        Double totalPrice = quantity * pricePerUnit;
        // Create and populate Quotation entity directly
        Quotation newQuotation = new Quotation();
        newQuotation.setQuotationRequestNo(quotationDTO.getQuotationRequestNo());
        newQuotation.setIngredientCode(quotationDTO.getIngredientCode());
        newQuotation.setSupplierRegNo(quotationDTO.getSupplierRegNo());
        newQuotation.setQuotationNo(getMaxQuotationNo());
        newQuotation.setAddedUser(auth.getName());
        newQuotation.setAddedDate(java.time.LocalDateTime.now());
        newQuotation.setPricePerUnit(pricePerUnit);
        newQuotation.setReceivedDate(LocalDate.now());
        newQuotation.setQuotationStatus(Quotation.QuotationStatus.Pending);
        newQuotation.setQuantity(quantity);
        newQuotation.setUnitType(unitType);
        newQuotation.setTotalPrice(totalPrice);
        newQuotation.setProposedDeliveryDate(quotationDTO.getProposedDeliveryDate());
        quotationRepository.save(newQuotation);

        // --- Auto-close logic for QuotationRequest ---
        QuotationRequest qRequest = quotationRequestRepository.findByRequestNo(quotationDTO.getQuotationRequestNo());
        if (qRequest != null && qRequest.getRequestStatus() == QuotationRequest.QRequestStatus.Send) {
            List<String> supplierRegNos = qRequest.getSuppliers();
            List<Quotation> submittedQuotations = quotationRepository.findByQuotationRequestNo(qRequest.getRequestNo());
            boolean allSuppliersSubmitted = supplierRegNos.stream()
                .allMatch(supRegNo -> submittedQuotations.stream()
                    .anyMatch(q -> q.getSupplierRegNo().equals(supRegNo)));
            java.time.LocalDate today = java.time.LocalDate.now();
            if (allSuppliersSubmitted && qRequest.getDeadline() != null && !today.isBefore(qRequest.getDeadline())) {
                qRequest.setRequestStatus(QuotationRequest.QRequestStatus.Closed);
                quotationRequestRepository.save(qRequest);
            }
        }
        return ResponseEntity.ok("Quotation Added Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllQuotations() {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "QUOTATION");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("select")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Quotation Request Send not Completed: You don't have permission!");
         }

        List<Quotation> quotationList = quotationRepository.findByQuotationStatusNotRemoved();
        List<QuotationDTO> dtoList = quotationList.stream().map(q -> {
            QuotationDTO dto = new QuotationDTO(
                q.getId(),
                q.getQuotationNo(),
                q.getQuotationRequestNo(),
                q.getIngredientCode(),
                q.getSupplierRegNo(),
                q.getPricePerUnit(),
                q.getReceivedDate(),
                q.getQuotationStatus(),
                q.getQuantity(),
                q.getUnitType(),
                q.getTotalPrice(),
                q.getProposedDeliveryDate()
            );
            return dto;
        }).toList();
        return ResponseEntity.ok(dtoList);
    }

    @Override
    public ResponseEntity<?> UpdateQuotation(QuotationDTO quotationDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "QUOTATION");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("update")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Quotation update not Completed: You don't have permission!");
        }

        Quotation exQuotation = quotationRepository.findByQuotationRequestNoAndSupplierRegNo(quotationDTO.getQuotationRequestNo(), quotationDTO.getSupplierRegNo());
        Quotation updatedQuotation = new Quotation().mapDTO(exQuotation, quotationDTO,auth.getName() );

        quotationRepository.save(updatedQuotation);
        // If this quotation is being accepted, close the request and reject others
        if (updatedQuotation.getQuotationStatus() == Quotation.QuotationStatus.Accepted) {
            // Close the QuotationRequest
            QuotationRequest qRequest = quotationRequestRepository.findByRequestNo(updatedQuotation.getQuotationRequestNo());
            if (qRequest != null && qRequest.getRequestStatus() != QuotationRequest.QRequestStatus.Closed) {
                qRequest.setRequestStatus(QuotationRequest.QRequestStatus.Closed);
                quotationRequestRepository.save(qRequest);
            }
            // Reject all other quotations for this request
            List<Quotation> allQuotations = quotationRepository.findByQuotationRequestNo(updatedQuotation.getQuotationRequestNo());
            for (Quotation q : allQuotations) {
                if (!q.getId().equals(updatedQuotation.getId()) && q.getQuotationStatus() != Quotation.QuotationStatus.Rejected) {
                    q.setQuotationStatus(Quotation.QuotationStatus.Rejected);
                    quotationRepository.save(q);
                }
            }
        }
        return ResponseEntity.ok("Quotation Updated Successfully");
    }

    @Override
    public ResponseEntity<?> DeleteQuotation(Integer id) {

        Quotation quotation = quotationRepository.findById(id).get();

        switch (quotation.getQuotationStatus()){
            case Accepted -> {
                return ResponseEntity.badRequest().body("Can't Delete an Active Quotation.");
            }
            case Pending,Rejected -> quotationRepository.deleteById(id);
            case Closed -> {
                quotation.setQuotationStatus(Quotation.QuotationStatus.Removed);
                quotationRepository.save(quotation);
            }
        }
        return ResponseEntity.ok("Quotation Deleted Successfully");
    }

    @Override
    public void saveSupplierQuotation(SupplierQuotationDTO supplierQuotationDTO, String requestNo, String supplierEmail) {
        
    }
}
