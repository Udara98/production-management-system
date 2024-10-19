package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRepository;
import com.AdwinsCom.AdwinsCom.entity.Quotation;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class QuotationService implements IQuotationService {

    final QuotationRepository quotationRepository;

    public QuotationService(QuotationRepository quotationRepository) {
        this.quotationRepository = quotationRepository;
    }

    @Override
    public ResponseEntity<?> AddNewQuotation(QuotationDTO quotationDTO, String userName) throws NoSuchAlgorithmException {
        Quotation exQuotation = quotationRepository.findByQuotationRequestNoAndSupplierRegNo(quotationDTO.getQuotationRequestNo(), quotationDTO.getSupplierRegNo());
        if (exQuotation != null && exQuotation.getQuotationStatus() != Quotation.QuotationStatus.Closed ) {
            return ResponseEntity.badRequest().body("There is an existing Quotation for these Quotation Request and Supplier");
        }
        Quotation newQuotation = new Quotation().mapDTO(null, quotationDTO, userName);
        quotationRepository.save(newQuotation);
        return ResponseEntity.ok("Quotation Added Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllQuotations() {
        List<Quotation> quotationList = quotationRepository.findByQuotationStatusNotRemoved();
        return ResponseEntity.ok(quotationList);
    }

    @Override
    public ResponseEntity<?> UpdateQuotation(QuotationDTO quotationDTO, String userName) throws NoSuchAlgorithmException {
        Quotation exQuotation = quotationRepository.findByQuotationRequestNoAndSupplierRegNo(quotationDTO.getQuotationRequestNo(), quotationDTO.getSupplierRegNo());
        Quotation updatedQuotation = new Quotation().mapDTO(exQuotation, quotationDTO, userName);

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
