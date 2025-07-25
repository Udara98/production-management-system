package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.Service.IQuotationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/quotation")
public class QuotationController {

    final IQuotationService quotationService;

    public QuotationController(IQuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public ModelAndView quotationModelAndView() {
        ModelAndView quotationMV = new ModelAndView();
        quotationMV.setViewName("quotation.html");
        return quotationMV;
    }

    @PostMapping()
    public ResponseEntity<?> AddNewQuotation(@RequestBody QuotationDTO quotationDTO) {
        try {
            return quotationService.AddNewQuotation(quotationDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllQuotations")
    public ResponseEntity<?> GetAllQuotations() {
        try {
            return quotationService.GetAllQuotations();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping()
    public ResponseEntity<?> EditQuotation(@RequestBody QuotationDTO quotationDTO) {
        try {
            return quotationService.UpdateQuotation(quotationDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteQuotation/{id}")
    public ResponseEntity<?> DeleteQuotation(@PathVariable Integer id){
        try {
            return quotationService.DeleteQuotation(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
