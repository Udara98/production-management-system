package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierWithIngredientsDTO;
import com.AdwinsCom.AdwinsCom.DTO.BankAccountDTO;
import com.AdwinsCom.AdwinsCom.Repository.BankAccountRepository;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierIngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.BankAccount;
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

    @Override
    public Supplier getSupplierByRegNo(String regNo) {
        return supplierRepository.getSupplierByRegNo(regNo);
    }

    @Autowired
    private SupplierIngredientRepository supplierIngredientRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private SupplierIngredientService supplierIngredientService;

    @Autowired
    private BankAccountRepository bankAccountRepository;

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


        Supplier newSupplier = new Supplier();
        newSupplier.setRegNo(supplierDTO.getRegNo());
        // New business type logic
        newSupplier.setBusinessType(supplierDTO.getBusinessType());
        newSupplier.setCompanyName(supplierDTO.getCompanyName());
        newSupplier.setBrn(supplierDTO.getBrn());
        newSupplier.setFirstName(supplierDTO.getFirstName());
        newSupplier.setSecondName(supplierDTO.getSecondName());
        newSupplier.setContactPersonName(supplierDTO.getContactPersonName());
        newSupplier.setNic(supplierDTO.getNic());
        newSupplier.setSupplierStatus(Supplier.SupplierStatus.Active);
        newSupplier.setAddedUser(userName);
        newSupplier.setAddedDate(LocalDateTime.now());
        // Fallback for deprecated fields (for backward compatibility)
        if (supplierDTO.getSupplierName() != null) newSupplier.setCompanyName(supplierDTO.getSupplierName());
        // Common fields
        newSupplier.setContactNo(supplierDTO.getContactNo());
        newSupplier.setEmail(supplierDTO.getEmail());
        newSupplier.setAddress(supplierDTO.getAddress());
        newSupplier.setJoinDate(supplierDTO.getJoinDate());
        newSupplier.setSupplierStatus(supplierDTO.getSupplierStatus());
        newSupplier.setNote(supplierDTO.getNote());
        newSupplier.setAddedUser(userName);
        newSupplier.setAddedDate(LocalDateTime.now());

        if (newSupplier.getRegNo() == null || newSupplier.getRegNo().isEmpty()) {
            newSupplier.setRegNo(getNextSupplierRegNo());
        }


        // Save supplier first to generate ID for FK
        supplierRepository.save(newSupplier);

        mapIngredients(supplierDTO, newSupplier);


        // Save bank account if present
        if (supplierDTO.getBankAccount() != null) {
            BankAccountDTO bankAccountDTO = supplierDTO.getBankAccount();
            BankAccount bankAccount = new BankAccount();
            bankAccount.setBankName(bankAccountDTO.getBankName());
            bankAccount.setBankBranch(bankAccountDTO.getBankBranch());
            bankAccount.setAccountNo(bankAccountDTO.getAccountNo());
            bankAccount.setAccountName(bankAccountDTO.getAccountName());
            bankAccount.setSupplier(newSupplier);
            bankAccountRepository.save(bankAccount);
            // Optionally add to supplier's list
            newSupplier.getBankAccounts().add(bankAccount);
        }

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

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIER");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("select")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Supplier GetAll not Completed: You don't have permission!");
         }

        List<Supplier> supplierList = supplierRepository.findBySupplierStatusNotRemoved();
        List<SupplierWithIngredientsDTO> suppliers = supplierIngredientService.GetSuppliersWithIngredients(supplierList);

        return ResponseEntity.ok(suppliers);
    }

    @Override
    public ResponseEntity<?> UpdateSupplier(SupplierDTO supplierDTO, String userName) {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIER");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("update")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Supplier Update not Completed: You don't have permission!");
         }

        Supplier supplier = supplierRepository.getSupplierByRegNo(supplierDTO.getRegNo());
        Supplier updatedSupplier = supplier;
        updatedSupplier.setSupplierName(supplierDTO.getSupplierName());
        updatedSupplier.setContactNo(supplierDTO.getContactNo());
        updatedSupplier.setEmail(supplierDTO.getEmail());
        updatedSupplier.setContactPersonName(supplierDTO.getContactPersonName());
        updatedSupplier.setAddress(supplierDTO.getAddress());
        updatedSupplier.setJoinDate(supplierDTO.getJoinDate());
        updatedSupplier.setSupplierStatus(supplierDTO.getSupplierStatus());
        updatedSupplier.setNote(supplierDTO.getNote());
        updatedSupplier.setUpdatedUser(userName);
        updatedSupplier.setUpdatedDate(LocalDateTime.now());

        // Update or add bank account
        if (supplierDTO.getBankAccount() != null) {
            BankAccountDTO bankAccountDTO = supplierDTO.getBankAccount();
            BankAccount bankAccount;
            // Try to update existing bank account if present
            if (updatedSupplier.getBankAccounts() != null && !updatedSupplier.getBankAccounts().isEmpty()) {
                bankAccount = updatedSupplier.getBankAccounts().get(0); // Assume one bank account per supplier for now
            } else {
                bankAccount = new BankAccount();
                bankAccount.setSupplier(updatedSupplier);
            }
            bankAccount.setBankName(bankAccountDTO.getBankName());
            bankAccount.setBankBranch(bankAccountDTO.getBankBranch());
            bankAccount.setAccountNo(bankAccountDTO.getAccountNo());
            bankAccount.setAccountName(bankAccountDTO.getAccountName());
            bankAccountRepository.save(bankAccount);
            // Ensure it's in the supplier's list
            if (updatedSupplier.getBankAccounts() == null || updatedSupplier.getBankAccounts().isEmpty()) {
                updatedSupplier.getBankAccounts().add(bankAccount);
            }
        }

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
                    .orElseThrow(() -> new RuntimeException("Ingredient not found: " + ingredient.getId()));
            managedIngredients.add(managedIngredient);
        }
        updatedSupplier.setIngredients(managedIngredients);
        supplierRepository.save(updatedSupplier);
    }

    public void RemoveIngFromSuppliers(Integer ingId){
     supplierIngredientService.DeleteIngWithSup(ingId);
    }
}
