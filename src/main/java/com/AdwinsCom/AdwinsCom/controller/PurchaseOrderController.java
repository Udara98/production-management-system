package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.PurchaseOrderDTO;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IPurchaseOrderService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/purchaseOrder")
public class PurchaseOrderController {
    final IPurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(IPurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView purchaseOrderModel() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedUser = userRepository.getUserByUserName(auth.getName());

        ModelAndView purOrderMV = new ModelAndView();
        purOrderMV.setViewName("ingOrders.html");
        purOrderMV.addObject("loggedUserName", auth.getName());
        purOrderMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());
        return purOrderMV;
    }

    @PostMapping("/addNewPurchaseOrder")
    public ResponseEntity<?> AddNewPurchaseOrder(@RequestBody PurchaseOrderDTO purchaseOrderDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return purchaseOrderService.AddNewPurchaseOrder(purchaseOrderDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllPurchaseOrders")
    public ResponseEntity<?> GetAllPurchaseOrders() {
        try {
            return purchaseOrderService.GetAllPurchaseOrders();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/findPendingPurchaseOrdersForGrn")
    public ResponseEntity<?> findPendingPurchaseOrdersForGrn() {
        try {
            return purchaseOrderService.findPendingPurchaseOrdersForGrn();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updatePurchaseOrder")
    public ResponseEntity<?> UpdatePurchaseOrder(@RequestBody PurchaseOrderDTO purchaseOrderDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return purchaseOrderService.UpdatePurchaseOrder(purchaseOrderDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deletePurchaseOrder/{id}")
    public ResponseEntity<?> DeletePurchaseOrder(@PathVariable Integer id){
        try {
            return purchaseOrderService.DeletePurchaseOrder(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


}
