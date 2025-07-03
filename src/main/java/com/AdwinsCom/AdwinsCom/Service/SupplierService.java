package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierWithIngredientsDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierIngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SupplierService implements ISupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SupplierIngredientRepository supplierIngredientRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private SupplierIngredientService supplierIngredientService;

    @Autowired
    private IPrivilegeService privilegeService;

    @Override
    @Transactional
    public ResponseEntity<?> AddNewSupplier(SupplierDTO supplierDTO, String userName) {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIER");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("insert")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Supplier Adds not Completed: You don't have permission!");
         }


        Supplier newSupplier = new Supplier().mapDTO(null, supplierDTO, userName);

        if (newSupplier.getRegNo() == null || newSupplier.getRegNo().isEmpty()) {
            newSupplier.setRegNo(getNextSupplierRegNo());
        }

        mapIngredients(supplierDTO, newSupplier);
        return ResponseEntity.ok("Supplier Registered Successfully");
    }

    public String getNextSupplierRegNo() {
        String maxRegNo = supplierRepository.getMaxRegNo(); // e.g. "SUP-0023"
        int nextNumber = 1;
        if (maxRegNo != null && maxRegNo.startsWith("SUP-")) {
            nextNumber = Integer.parseInt(maxRegNo.substring(4)) + 1;
        }
        return String.format("SUP-%04d", nextNumber);
    }

    @Override
    public ResponseEntity<?> GetAllSuppliers() {
        List<Supplier> supplierList = supplierRepository.findBySupplierStatusNotRemoved();
        List<SupplierWithIngredientsDTO> suppliers = supplierIngredientService.GetSuppliersWithIngredients(supplierList);

        return ResponseEntity.ok(suppliers);
    }

    @Override
    public ResponseEntity<?> UpdateSupplier(SupplierDTO supplierDTO, String userName) {

        Supplier supplier = supplierRepository.getSupplierByRegNo(supplierDTO.getRegNo());
        Supplier updatedSupplier = new Supplier().mapDTO(supplier, supplierDTO, userName);

        mapIngredients(supplierDTO, updatedSupplier);
        return ResponseEntity.ok("Supplier Updated Successfully");
    }

    @Override
    public ResponseEntity<String> DeleteSupplier(Supplier supplier) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("delete")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Supplier delete not Completed: You don't have permission!");
        }

        try {
            // Soft delete by setting the status to false

            // Load the existing supplier from the database
            Supplier existingSupplier = supplierRepository.findById(supplier.getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));

            // Update only the status
            existingSupplier.setSupplierStatus(Supplier.SupplierStatus.Removed);

            // Save without affecting relationships
            supplierRepository.save(existingSupplier);

            // Return 200 OK when deletion is successful
            return ResponseEntity.status(HttpStatus.OK)
                    .body("Supplier Removed successfully.");
        } catch (Exception e) {
            // Handle any exceptions and return 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("User deletion not completed: " + e.getMessage());
        }

    }

    private void mapIngredients(SupplierDTO supplierDTO, Supplier updatedSupplier) {
        Set<Ingredient> managedIngredients = new HashSet<>();
        for (Ingredient ingredient : supplierDTO.getIngredients()) {
            Ingredient managedIngredient = ingredientRepository.findById(ingredient.getId())
                    .orElse(ingredient);
            managedIngredients.add(managedIngredient);
        }
        updatedSupplier.setIngredients(managedIngredients);

        supplierRepository.save(updatedSupplier);
    }

    public void RemoveIngFromSuppliers(Integer ingId){
     supplierIngredientService.DeleteIngWithSup(ingId);
    }
}
