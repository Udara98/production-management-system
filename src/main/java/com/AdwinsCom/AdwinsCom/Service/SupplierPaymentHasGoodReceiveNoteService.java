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

    // public java.util.List<com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO> getSupplierPaymentReport() {
    //     java.util.List<Object[]> rows = supplierPaymentHasGoodReceiveNoteRepository.getSupplierPaymentReport();
    //     java.util.List<com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO> result = new java.util.ArrayList<>();
    //     for (Object[] row : rows) {
    //         String supNo = row[0] != null ? row[0].toString() : null;
    //         String supplierName = row[1] != null ? row[1].toString() : null;
    //         Double amountPaid = row[2] != null ? Double.valueOf(row[2].toString()) : null;
    //         Double outstandingAmount = row[3] != null ? Double.valueOf(row[3].toString()) : null;
    //         com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO dto = new com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO();
    //         dto.setSupNo(supNo);
    //         dto.setSupplierName(supplierName);
    //         dto.setAmountPaid(amountPaid);
    //         dto.setOutstandingAmount(outstandingAmount);
    //         result.add(dto);
    //     }
    //     return result;
    // }

    public java.util.List<com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO> getSupplierPaymentReportByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.util.List<Object[]> rows = supplierPaymentHasGoodReceiveNoteRepository.getSupplierPaymentReportByDateRangeQ(startDate.toString(), endDate.toString());
        java.util.List<com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO> result = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            String supNo = row[0] != null ? row[0].toString() : null;
            String supplierName = row[1] != null ? row[1].toString() : null;
            Double amountPaid = row[2] != null ? Double.valueOf(row[2].toString()) : null;
            Double outstandingAmount = row[3] != null ? Double.valueOf(row[3].toString()) : null;
            com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO dto = new com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO();
            dto.setSupNo(supNo);
            dto.setSupplierName(supplierName);
            dto.setAmountPaid(amountPaid);
            dto.setOutstandingAmount(outstandingAmount);
            result.add(dto);
        }
        return result;
    }
}
