package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRepository;
import com.AdwinsCom.AdwinsCom.entity.Quotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;

@Service
public class QuotationService implements IQuotationService {

    final QuotationRepository quotationRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public QuotationService(QuotationRepository quotationRepository) {
        this.quotationRepository = quotationRepository;
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
        Quotation newQuotation = new Quotation().mapDTO(null, quotationDTO, auth.getName());
        quotationRepository.save(newQuotation);
        return ResponseEntity.ok("Quotation Added Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllQuotations() {
        List<Quotation> quotationList = quotationRepository.findByQuotationStatusNotRemoved();
        return ResponseEntity.ok(quotationList);
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
}
