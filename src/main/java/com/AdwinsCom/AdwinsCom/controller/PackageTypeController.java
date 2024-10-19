package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Service.IPackageTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/packageType")
public class PackageTypeController {

    final IPackageTypeService packageTypeService;

    public PackageTypeController(IPackageTypeService packageTypeService) {
        this.packageTypeService = packageTypeService;
    }

    @PostMapping("/addNewPackageType/{pt}")
    public ResponseEntity<?> AddNewPackageType(@PathVariable String pt){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return packageTypeService.AddNewPackageType(pt, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    @GetMapping("/getAllPackageTypes")
    public ResponseEntity<?> GetAllPackageTypes(){
        try {
            return packageTypeService.GetAllPackageTypes();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updatePT/{id}/{pt}")
    public ResponseEntity<?> UpdatePT(@PathVariable String id, @PathVariable String pt){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return packageTypeService.UpdatePackageType(id,pt, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deletePT/{id}")
    public ResponseEntity<?> DeletePT(@PathVariable String id){
        try {
            return packageTypeService.DeletePackageType(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

}
