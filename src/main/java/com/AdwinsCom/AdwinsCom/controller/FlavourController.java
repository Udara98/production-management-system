package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Service.IFlavourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/flavour")
public class FlavourController {

    final IFlavourService flavourService;

    public FlavourController(IFlavourService flavourService) {
        this.flavourService = flavourService;
    }

    @PostMapping("/addNewFlavour/{flavour}")
    public ResponseEntity<?> AddNewFlavour(@PathVariable String flavour){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return flavourService.AddNewFlavour(flavour,auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    @GetMapping("/getAllFlavours")
    private ResponseEntity<?> GetAllFlavours(){
        try {
            return flavourService.GetAllFlavours();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateFlavour/{id}/{flavour}")
    private ResponseEntity<?> UpdateFlavour(@PathVariable String id, @PathVariable String flavour){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return flavourService.UpdateFlavour(id,flavour,auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteFlavour/{id}")
    private ResponseEntity<?> DeleteFlavour(@PathVariable String id){
        try {
            return flavourService.DeleteFlavour(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
