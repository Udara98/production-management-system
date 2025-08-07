package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.QRequestGetDTO;
import com.AdwinsCom.AdwinsCom.DTO.QuotationRequestEmailDTO;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IQuotationRequestService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/quotation-request")
public class QuotationRequestController {

    final IQuotationRequestService quotationRequestService;

    public QuotationRequestController(IQuotationRequestService quotationRequestService) {
        this.quotationRequestService = quotationRequestService;
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView quotationRequestModelAndView(){

        // Get authenticated logged user authentication object using security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedUser = userRepository.getUserByUserName(auth.getName());


        ModelAndView quotationRequestMV = new ModelAndView();
        quotationRequestMV.setViewName("quotationRequest.html");
        return quotationRequestMV;
    }

    @PostMapping("/send-new/{ingId}")
    public ResponseEntity<?> SendNewQuotationRequest(@PathVariable Integer ingId ,@RequestBody QRequestGetDTO request ) {
        try {
            System.out.println(request);
            return quotationRequestService.AddNewQuotationRequest(ingId,request);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/sendToAllSuppliers")
    public ResponseEntity<?> sendToAllSuppliers(@RequestBody QuotationRequestEmailDTO emailDTO) {
        return quotationRequestService.sendQuotationRequestToAllSuppliers(emailDTO);
    }

    @GetMapping("/send")
    public ResponseEntity<?> getAllSendQuotationRequests() {
        try {
            return quotationRequestService.GetAllSendQuotationRequests();
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

    @GetMapping("/getAllRequestsNotRemoved")
    public ResponseEntity<?> findAllByRequestStatusNotRemoved() {
        try {
            return quotationRequestService.findQuotationRequestByStatusNotRemoved();
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
