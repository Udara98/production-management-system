package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import com.AdwinsCom.AdwinsCom.Service.ICustomerPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/cusPayment")
public class CustomerPaymentController {

    final ICustomerPaymentService customerPaymentService;

    public CustomerPaymentController(ICustomerPaymentService customerPaymentService) {
        this.customerPaymentService = customerPaymentService;
    }

    @PostMapping("/addNewCusPayment")
    public ResponseEntity<?> AddNewCusPayment(@RequestBody CustomerPaymentDTO customerPaymentDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return customerPaymentService.AddNewCustomerPayment(customerPaymentDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllCusPayments")
    public ResponseEntity<?> GetAllCusPayments(){
        try {
            return customerPaymentService.GetAllCustomerPayments();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/gtAllUnpaidCustomerPayments")
    public ResponseEntity<?> gtAllUnpaidCustomerPayments(){
        try {
            return customerPaymentService.GetAllUnpaidCustomerPayments();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
