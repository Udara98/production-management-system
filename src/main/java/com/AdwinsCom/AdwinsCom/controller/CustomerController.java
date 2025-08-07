package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.Service.ICustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    final ICustomerService customerService;

    public CustomerController(ICustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/addNewCustomer")
    public ResponseEntity<?> AddNewCustomer(@RequestBody CustomerDTO customerDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return customerService.AddNewCustomer(customerDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Integer id) {
        return customerService.DeleteCustomer(id);
    }

    @GetMapping("/getAllCustomers")
    public ResponseEntity<?> GetAllCustomers(){
        try {
            return customerService.GetAllCustomers();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    @PutMapping("/updateCustomer")
    public ResponseEntity<?> Update(@RequestBody CustomerDTO customerDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return customerService.UpdateCustomer(customerDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

}
