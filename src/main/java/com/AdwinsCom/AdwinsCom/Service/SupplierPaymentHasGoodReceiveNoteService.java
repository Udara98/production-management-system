package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.SupplierPaymentHasGoodReceiveNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierPaymentHasGoodReceiveNoteService implements ISupplierPaymentHasGoodReceiveNoteService{

    @Autowired
    private SupplierPaymentHasGoodReceiveNoteRepository supplierPaymentHasGoodReceiveNoteRepository;

    @Override
    public ResponseEntity<?> findGrnNumbersBySupplierPaymentId(Integer supplierPaymentId) {
        // Get the list of GRN numbers based on the Supplier Payment ID
        List<String> grnNumbers = supplierPaymentHasGoodReceiveNoteRepository.findGrnNumbersBySupplierPaymentId(supplierPaymentId);

        // Check if GRN numbers were found
        if (grnNumbers.isEmpty()) {
            return ResponseEntity.noContent().build(); // Return 204 if no GRNs are found
        } else {
            return ResponseEntity.ok(grnNumbers); // Return 200 with the list of GRN numbers
        }
    }
}
