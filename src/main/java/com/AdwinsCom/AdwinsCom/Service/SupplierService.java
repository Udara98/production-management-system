package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierDTOShort;
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

import java.time.LocalDate;
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

        //Check Dupplicate values
        if (supplierRepository.existsByRegNo(supplierDTO.getRegNo())) {
            return ResponseEntity.badRequest().body("Supplier Adds not Completed: Reg No already exists!");
        }
        if (supplierRepository.existsByContactNo(supplierDTO.getContactNo())) {
            return ResponseEntity.badRequest().body("Supplier Adds not Completed: Contact No already exists!");
        }
        if (supplierRepository.existsByEmail(supplierDTO.getEmail())) {
            return ResponseEntity.badRequest().body("Supplier Adds not Completed: Email already exists!");
        }

        if (supplierDTO.getBrn() != null && !supplierDTO.getBrn().trim().isEmpty()) {
            if (supplierRepository.existsByBrn(supplierDTO.getBrn())) {
                return ResponseEntity.badRequest().body("Supplier Add not Completed: BRN already exists!");
            }
        }

        if (supplierDTO.getCompanyName() != null && !supplierDTO.getCompanyName().trim().isEmpty()) {
            if (supplierRepository.existsByBrn(supplierDTO.getCompanyName())) {
                return ResponseEntity.badRequest().body("Supplier Adds not Completed: Company Name already exists!");
            }
        }

        // New business type logic
        newSupplier.setBusinessType(supplierDTO.getBusinessType());
        newSupplier.setCompanyName(supplierDTO.getCompanyName());
        newSupplier.setBrn(supplierDTO.getBrn());
        newSupplier.setFirstName(supplierDTO.getFirstName());
        newSupplier.setSecondName(supplierDTO.getSecondName());
        newSupplier.setSupplierStatus(Supplier.SupplierStatus.Active);
        newSupplier.setContactPersonName(supplierDTO.getContactPersonName());
        newSupplier.setNic(supplierDTO.getNic());
        newSupplier.setJoinDate(LocalDate.now());
        newSupplier.setAddedUser(userName);
        newSupplier.setAddedDate(LocalDateTime.now());
        // Fallback for deprecated fields (for backward compatibility)
        // Common fields
        newSupplier.setContactNo(supplierDTO.getContactNo());
        newSupplier.setEmail(supplierDTO.getEmail());
        newSupplier.setAddress(supplierDTO.getAddress());
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

        Supplier uppdatedSupplier = supplierRepository.getSupplierByRegNo(supplierDTO.getRegNo());
        uppdatedSupplier.setUpdatedUser(userName);
        uppdatedSupplier.setContactNo(supplierDTO.getContactNo());
        uppdatedSupplier.setBusinessType(supplierDTO.getBusinessType());
        uppdatedSupplier.setEmail(supplierDTO.getEmail());
        uppdatedSupplier.setContactPersonName(supplierDTO.getContactPersonName());
        uppdatedSupplier.setAddress(supplierDTO.getAddress());
        uppdatedSupplier.setJoinDate(LocalDate.now());
        uppdatedSupplier.setUpdatedUser(userName);
        uppdatedSupplier.setCompanyName(supplierDTO.getCompanyName());
        uppdatedSupplier.setBrn(supplierDTO.getBrn());
        uppdatedSupplier.setSupplierStatus(supplierDTO.getSupplierStatus());
        uppdatedSupplier.setNote(supplierDTO.getNote());
        uppdatedSupplier.setContactNo(supplierDTO.getContactNo());
        uppdatedSupplier.setFirstName(supplierDTO.getFirstName());
        uppdatedSupplier.setSecondName(supplierDTO.getSecondName());
        uppdatedSupplier.setNic(supplierDTO.getNic());
        uppdatedSupplier.setUpdatedUser(userName);
        uppdatedSupplier.setUpdatedDate(LocalDateTime.now());

        // Update or add bank account
        if (supplierDTO.getBankAccount() != null) {
            BankAccountDTO bankAccountDTO = supplierDTO.getBankAccount();
            BankAccount bankAccount;
            // Try to update existing bank account if present
            if (uppdatedSupplier.getBankAccounts() != null && !uppdatedSupplier.getBankAccounts().isEmpty()) {
                bankAccount = uppdatedSupplier.getBankAccounts().get(0); // Assume one bank account per supplier for now
            } else {
                bankAccount = new BankAccount();
                bankAccount.setSupplier(uppdatedSupplier);
            }
            bankAccount.setBankName(bankAccountDTO.getBankName());
            bankAccount.setBankBranch(bankAccountDTO.getBankBranch());
            bankAccount.setAccountNo(bankAccountDTO.getAccountNo());
            bankAccount.setAccountName(bankAccountDTO.getAccountName());
            bankAccountRepository.save(bankAccount);
            // Ensure it's in the supplier's list
            if (uppdatedSupplier.getBankAccounts() == null || uppdatedSupplier.getBankAccounts().isEmpty()) {
                uppdatedSupplier.getBankAccounts().add(bankAccount);
            }
        }

        if(!supplierDTO.getIngredientList().equals(uppdatedSupplier.getIngredients())) {
            mapIngredients(supplierDTO, uppdatedSupplier);
        }
        return ResponseEntity.ok("Supplier Updated Successfully");
    }

    @Override
    public ResponseEntity<String> DeleteSupplier(Supplier supplier) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIER");

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
        for ( SupplierDTOShort ingredient : supplierDTO.getIngredientList()) {
            Ingredient managedIngredient = ingredientRepository.findByIngredientCode(ingredient.getIngredientCode());
            managedIngredients.add(managedIngredient);
        }
        updatedSupplier.setIngredients(managedIngredients);
        supplierRepository.save(updatedSupplier);
    }

    public void RemoveIngFromSuppliers(Integer ingId){
     supplierIngredientService.DeleteIngWithSup(ingId);
    }
}
