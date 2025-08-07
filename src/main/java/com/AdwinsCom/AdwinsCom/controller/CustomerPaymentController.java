package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import com.AdwinsCom.AdwinsCom.Service.ICustomerPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/cusPayment")
public class CustomerPaymentController {

    final ICustomerPaymentService customerPaymentService;

    public CustomerPaymentController(ICustomerPaymentService customerPaymentService) {
        this.customerPaymentService = customerPaymentService;
    }

    @PostMapping()
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

    // Endpoint to get the latest completed payment by order ID
    @GetMapping(value = "/latest-completed", produces = "application/json")
    public ResponseEntity<?> getLatestCompletedPaymentByOrderId(@RequestParam("orderid") int orderid) {
        return customerPaymentService.getLatestCompletedPaymentByOrderId(orderid);
    }

    @GetMapping("/receipt/{id}")
    public ModelAndView printCustomerPaymentReceipt(@PathVariable("id") int id) {
        ModelAndView mv = new ModelAndView("fragments/Sales/CustomerPayment/CustomerPaymentReceipt");
        CustomerPaymentDTO payment = customerPaymentService.getCustomerPaymentById(id);
        mv.addObject("payment", payment);
        return mv;
    }
}

