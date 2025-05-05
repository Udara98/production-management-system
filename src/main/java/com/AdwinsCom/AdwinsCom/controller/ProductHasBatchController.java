package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Repository.ProductHasBatchRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IPrivilegeService;
import com.AdwinsCom.AdwinsCom.Service.IProductHasBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/productHasBatch")
public class ProductHasBatchController {

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private UserRepository userRepository;

    final IProductHasBatchService productHasBatchService;
    final ProductHasBatchRepository productHasBatchRepository;

    public ProductHasBatchController(IProductHasBatchService productHasBatchService, ProductHasBatchRepository productHasBatchRepository) {
        this.productHasBatchService = productHasBatchService;
        this.productHasBatchRepository = productHasBatchRepository;
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> GetAll() {
        try {
            return productHasBatchService.GetAll();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getByProductId/{productId}")
    public ResponseEntity<?> getProductHasBatchByProductId(@PathVariable Integer productId) {
        try {
            return productHasBatchService.getProductHasBatchByProductId(productId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
