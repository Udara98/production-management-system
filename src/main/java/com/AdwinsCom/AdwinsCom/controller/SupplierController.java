package com.AdwinsCom.AdwinsCom.controller;
import java.util.List;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.Service.ISupplierService;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;


@RestController
@RequestMapping(value = "/supplier")
public class SupplierController {
    
    @Autowired
    private ISupplierService supplierService;

    @GetMapping
    public ModelAndView supplierModelAndView() {
        ModelAndView supplierMV = new ModelAndView();
        supplierMV.setViewName("supplier.html");
        return supplierMV;
    }

    @PostMapping("/addNewSupplier")
    public ResponseEntity<?> AddNewSupplier(@RequestBody SupplierDTO supplierDTO){
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return supplierService.AddNewSupplier(supplierDTO, auth.getName());
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllSuppliers")
    public ResponseEntity<?> GetAllSuppliers(){
        try{
            return supplierService.GetAllSuppliers();
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateSupplier")
    public ResponseEntity<?> UpdateSupplier(@RequestBody SupplierDTO supplierDTO){
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return supplierService.UpdateSupplier(supplierDTO, auth.getName());
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteSupplier/{id}")
    public ResponseEntity<?> DeleteSupplier(@PathVariable Integer id){
        try{
            return supplierService.DeleteSupplier(id);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


}
