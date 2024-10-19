package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Service.IQuotationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/quotation-request")
public class QuotationRequestController {

    final IQuotationRequestService quotationRequestService;

    public QuotationRequestController(IQuotationRequestService quotationRequestService) {
        this.quotationRequestService = quotationRequestService;
    }

    @GetMapping
    public ModelAndView quotationRequestModelAndView(){
        ModelAndView quotationRequestMV = new ModelAndView();
        quotationRequestMV.setViewName("quotationRequest.html");
        return quotationRequestMV;
    }

    @PostMapping("/send-new/{ingId}")
    public ResponseEntity<?> SendNewQuotationRequest(@PathVariable Integer ingId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return quotationRequestService.AddNewQuotationRequest(ingId, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllRequests")
    public ResponseEntity<?> GetAllRequests() {
        try {
            return quotationRequestService.GetAllQuotationRequests();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteQRequest/{id}")
    public ResponseEntity<?> DeleteRequest(@PathVariable Integer id) {
        try {
            return quotationRequestService.DeleteQuotationRequest(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
