package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import com.AdwinsCom.AdwinsCom.Service.ICustomerOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/customerOrder")
public class CustomerOrderController {

    final ICustomerOrderService customerOrderService;

    public CustomerOrderController(ICustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @GetMapping
    public ModelAndView customerOrderModelAndView() {
        ModelAndView customerOrderMV = new ModelAndView();
        customerOrderMV.setViewName("sales.html");
        return customerOrderMV;
    }

    @PostMapping("/addNewCustomerOrder")
    public ResponseEntity<?> AddNewCustomerOrder(@RequestBody CustomerOrderDTO customerOrderDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return customerOrderService.AddNewCustomerOrder(customerOrderDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllCustomerOrders")
    public ResponseEntity<?> GetAllCustomerOrders() {
        try {
            return customerOrderService.GetAllCustomerOrders();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/unpaidCustomerOrders")
    public ResponseEntity<?> unpaidCustomerOrders() {
        try {
            return customerOrderService.gtAllUnpaidCustomerOrders();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


}
