package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Service.SupplierPaymentHasGoodReceiveNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/SupplierPaymentHasGoodReceiveNote")
public class SupplierPaymentHasGoodReceiveNoteController {

    @Autowired
    private SupplierPaymentHasGoodReceiveNoteService supplierPaymentHasGoodReceiveNoteService;

    @GetMapping("/{supplierPaymentId}/grn-numbers")
    public ResponseEntity<?> getGrnNumbersBySupplierPaymentId(@PathVariable Integer supplierPaymentId) {
        return supplierPaymentHasGoodReceiveNoteService.findGrnNumbersBySupplierPaymentId(supplierPaymentId);
    }
}
