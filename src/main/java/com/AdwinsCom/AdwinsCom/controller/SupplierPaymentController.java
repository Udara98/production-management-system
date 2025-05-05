package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import com.AdwinsCom.AdwinsCom.Service.ISupplierPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/supplier_payment")
public class SupplierPaymentController {

    final ISupplierPaymentService  supplierPaymentService;
    public SupplierPaymentController(ISupplierPaymentService supplierPaymentService) {
        this.supplierPaymentService = supplierPaymentService;
    }

    @PostMapping("/addNewSP")
    public ResponseEntity<?> AddNewSupplierPayment(@RequestBody SupplierPaymentDTO supplierPaymentDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return supplierPaymentService.AddNewSupplierPayment(supplierPaymentDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllSP")
    public ResponseEntity<?> GetAllSupplierPayments(){
        try {
            return supplierPaymentService.GetAllSupplierPayment();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
