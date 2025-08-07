package com.AdwinsCom.AdwinsCom.controller;
import java.util.List;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.ISupplierService;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;


@RestController
@RequestMapping(value = "/supplier")
public class SupplierController {
    
    @GetMapping("/byRegNo/{regNo}")
    public ResponseEntity<?> getSupplierByRegNo(@PathVariable String regNo) {
        Supplier supplier = supplierService.getSupplierByRegNo(regNo);
        if (supplier == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(supplier);
    }
    
    @Autowired
    private ISupplierService supplierService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView supplierModelAndView() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User loggedUser = userRepository.getUserByUserName(auth.getName());

        ModelAndView supplierMV = new ModelAndView();
        supplierMV.setViewName("supplier.html");
        supplierMV.addObject("loggedUserName", auth.getName());
        supplierMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());

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

    @PutMapping(value = "/updateSupplier", consumes = {"application/json", "application/json;charset=UTF-8"})    public ResponseEntity<?> UpdateSupplier(@RequestBody SupplierDTO supplierDTO){
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println(supplierDTO);
            return supplierService.UpdateSupplier(supplierDTO, auth.getName());
        }catch (Exception e){
            System.out.println(supplierDTO);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping()
    public ResponseEntity<?> DeleteSupplier(@RequestBody Supplier supplier){
        try{
            return supplierService.DeleteSupplier(supplier);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


}
