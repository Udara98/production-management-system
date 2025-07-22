package com.AdwinsCom.AdwinsCom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.AdwinsCom.AdwinsCom.Service.BatchService;
import com.AdwinsCom.AdwinsCom.Service.BatchService;
import com.AdwinsCom.AdwinsCom.Service.ICustomerOrderService;
import com.AdwinsCom.AdwinsCom.DTO.BatchProductionReportDTO;
import com.AdwinsCom.AdwinsCom.DTO.CustomerSalesSummaryDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * 
 */
@RestController
@RequestMapping(value = "/report")
public class ReportController {

    @Autowired
    private com.AdwinsCom.AdwinsCom.Repository.ProductRepository productRepository;
    @Autowired
    private com.AdwinsCom.AdwinsCom.Repository.IngredientRepository ingredientRepository;


    @Autowired
    private ICustomerOrderService customerOrderService;

    @Autowired
    private com.AdwinsCom.AdwinsCom.Service.GoodReceiveNoteService goodReceiveNoteService;

    @Autowired
    private BatchService batchService;

    /**
     * 
     * @return 
     */
    @GetMapping
    public ModelAndView reportModelAndView() {
        ModelAndView reportMV = new ModelAndView();
        reportMV.setViewName("report.html");
        return reportMV;
    }

    /**
     * 
     * @param startDate 
     * @param endDate 
     * @return 
     */
    @GetMapping(value = "/customerSalesSummary")
    public ResponseEntity<List<CustomerSalesSummaryDTO>> customerSalesSummary(@RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(customerOrderService.getCustomerSalesSummary(startDate, endDate));
    }

    /**
     * 
     * @param startDate 
     * @param endDate 
     * @return 
     */
    @GetMapping(value = "/productSalesSummary")
    public ResponseEntity<List<ProductSalesSummaryDTO>> productSalesSummary(@RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(customerOrderService.getProductSalesSummary(startDate, endDate));
    }
    /**
     * GRN Ingredient Summary Report
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping(value = "/grnIngredientSummary")
    public ResponseEntity<List<com.AdwinsCom.AdwinsCom.DTO.GrnIngredientSummaryDTO>> grnIngredientSummary(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") java.time.LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") java.time.LocalDate endDate) {
        return ResponseEntity.ok(goodReceiveNoteService.getGrnIngredientSummary(startDate, endDate));
    }

    // @GetMapping(value="/batch")
    @GetMapping(value = "/batchProduction")
    public ResponseEntity<List<BatchProductionReportDTO>> batchProductionReport(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") java.time.LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") java.time.LocalDate endDate) {

                
       
        java.time.LocalDateTime startDateTime = startDate.atStartOfDay();
        java.time.LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        return ResponseEntity.ok(batchService.getBatchProductionReportByDateRange(startDateTime, endDateTime));
    }

    @GetMapping(value = "/supplierPayment")
    public ResponseEntity<List<SupplierPaymentReportDTO>> supplierPaymentReport(
    @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
    @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {

        java.time.LocalDate startDateTime = startDate;
        java.time.LocalDate endDateTime = endDate;
    return ResponseEntity.ok(batchService.getSupplierPaymentReportByDateRange(startDateTime, endDateTime));
}

    // --- Update Product ROP Endpoint ---
    @org.springframework.web.bind.annotation.PostMapping("/updateProductRop")
    public ResponseEntity<?> updateProductRop(@org.springframework.web.bind.annotation.RequestBody java.util.List<java.util.Map<String, Object>> ropList) {
        try {
            for (java.util.Map<String, Object> entry : ropList) {
                String productName = (String) entry.get("productName");
                Number generatedRop = (Number) entry.get("generatedRop");
                if (productName != null && generatedRop != null) {
                    com.AdwinsCom.AdwinsCom.entity.Product product = productRepository.findByProductName(productName);
                    if (product != null) {
                        product.setReorderPoint(generatedRop != null ? generatedRop.intValue() : null);
                        productRepository.save(product);
                    }
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update Product ROP: " + e.getMessage());
        }
    }

    // --- Update Ingredient ROP Endpoint ---
    @org.springframework.web.bind.annotation.PostMapping("/updateIngredientRop")
    public ResponseEntity<?> updateIngredientRop(@org.springframework.web.bind.annotation.RequestBody java.util.List<java.util.Map<String, Object>> ropList) {
        try {
            for (java.util.Map<String, Object> entry : ropList) {
                String ingredientCode = (String) entry.get("ingredientCode");
                Number generatedRop = (Number) entry.get("generatedRop");
                if (ingredientCode != null && generatedRop != null) {
                    com.AdwinsCom.AdwinsCom.entity.Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(ingredientCode);
                    if (ingredient != null) {
                        System.out.println("Ingredient found: " + generatedRop);
                        ingredient.setRop(generatedRop != null ? generatedRop.intValue() : null);
                        System.out.println("Ingredient ROP updated: " + ingredient);
                        ingredientRepository.save(ingredient);
                    }
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update Ingredient ROP: " + e.getMessage());
        }
    }
}
