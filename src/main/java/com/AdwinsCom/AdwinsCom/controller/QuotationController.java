package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.QuotationDTO;
import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IQuotationService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/quotation")
public class QuotationController {

    final IQuotationService quotationService;

    public QuotationController(IQuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView quotationModelAndView() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedUser = userRepository.getUserByUserName(auth.getName());

        ModelAndView quotationMV = new ModelAndView();
        quotationMV.setViewName("quotation.html");
        quotationMV.addObject("loggedUserName", auth.getName());
        quotationMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());

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
