package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import com.AdwinsCom.AdwinsCom.Service.ICustomerOrderService;
import com.AdwinsCom.AdwinsCom.Service.OrderAssignmentService;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/customerOrder")
public class CustomerOrderController {

    final ICustomerOrderService customerOrderService;
    final OrderAssignmentService orderAssignmentService;

    public CustomerOrderController(ICustomerOrderService customerOrderService, OrderAssignmentService orderAssignmentService) {
        this.customerOrderService = customerOrderService;
        this.orderAssignmentService = orderAssignmentService;
    }

    @GetMapping
    public ModelAndView customerOrderModelAndView() {
        ModelAndView customerOrderMV = new ModelAndView();
        customerOrderMV.setViewName("sales.html");
        return customerOrderMV;
    }

    @PostMapping(value = "/addNewCustomerOrder")
    public ResponseEntity<?> addNewCustomerOrder(@RequestBody CustomerOrderDTO customerOrderDTO) {
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

    @GetMapping("/unpaid")
    public ResponseEntity<?> getUnpaidOrdersByCustomer(@RequestParam("customerId") Integer customerId) {
        try {
            return customerOrderService.getUnpaidOrdersByCustomer(customerId);
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
    @GetMapping("/invoice/{orderId}")
    public ModelAndView printInvoice(@PathVariable Integer orderId) {
        // Fetch order by ID (using repository directly for now)
        // You can move this logic to the service layer if preferred
        CustomerOrder order = null;
        try {
            order = customerOrderService.getOrderEntityById(orderId);
        } catch (Exception e) {
            return new ModelAndView("error").addObject("message", "Order not found");
        }
        ModelAndView mv = new ModelAndView("fragments/Sales/CustomerOrder/CustomerOrderInvoice");
        mv.addObject("order", order);
        return mv;
    }

    @GetMapping("/assign/{orderId}")
    public ResponseEntity<?> assignOrder(@PathVariable Integer orderId) {
        try {
            return orderAssignmentService.assignOrder(orderId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

}
