package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.BankAccountDTO;
import com.AdwinsCom.AdwinsCom.entity.BankAccount;

import com.AdwinsCom.AdwinsCom.DTO.SupplierWithIngredientsDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierIngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import com.AdwinsCom.AdwinsCom.entity.SupplierIngredient;
import com.AdwinsCom.AdwinsCom.entity.SupplierIngredientsId;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SupplierIngredientService {
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private SupplierIngredientRepository supplierIngredientRepository;
    @Autowired
    private IngredientRepository ingredientRepository;

    public List<SupplierWithIngredientsDTO> GetSuppliersWithIngredients(List<Supplier> suppliers) {

        List<SupplierWithIngredientsDTO> supplierList = new ArrayList<>();
        for (Supplier s : suppliers
        ) {
            List<Ingredient> ingredients = new ArrayList<>();
            List<SupplierIngredient> supplierIngredients = supplierIngredientRepository.findBySupplierId(s.getId());
            for (SupplierIngredient si : supplierIngredients
            ) {
                Ingredient ingredient = ingredientRepository.findById(si.getIngredientId()).get();
                ingredients.add(ingredient);
            }
            SupplierWithIngredientsDTO supplier = getSupplierWithIngredientsDTO(s, ingredients);
            supplierList.add(supplier);
        }

        return supplierList;
    }

    private static SupplierWithIngredientsDTO getSupplierWithIngredientsDTO(Supplier s, List<Ingredient> ingredients) {
        SupplierWithIngredientsDTO supplier = new SupplierWithIngredientsDTO();
        supplier.setId(s.getId());
        supplier.setRegNo(s.getRegNo());
        supplier.setSupplierName(s.getSupplierName());
        supplier.setContactPersonName(s.getContactPersonName());
        supplier.setContactNo(s.getContactNo());
        supplier.setEmail(s.getEmail());
        supplier.setAddress(s.getAddress());
        supplier.setNote(s.getNote());
        supplier.setJoinDate(s.getJoinDate());
        supplier.setSupplierStatus(s.getSupplierStatus());
        supplier.setAddedUser(s.getAddedUser());
        supplier.setAddedDate(s.getAddedDate());
        supplier.setUpdatedDate(s.getUpdatedDate());
        supplier.setUpdatedUser(s.getUpdatedUser());
        supplier.setIngredients(ingredients);
        // Map a single bank account to DTO
        BankAccountDTO bankAccountDTO = null;
        if (s.getBankAccounts() != null && !s.getBankAccounts().isEmpty()) {
            BankAccount ba = s.getBankAccounts().get(0); // Use the first bank account
            bankAccountDTO = new BankAccountDTO(
                ba.getId(),
                ba.getBankName(),
                ba.getBankBranch(),
                ba.getAccountNo(),
                ba.getAccountName()
            );
        }
        supplier.setBankAccount(bankAccountDTO);
        return supplier;
    }

    public List<String> GetSuppliersByIngredientId(Integer id) {
        List<SupplierIngredient> supplierIngredients = supplierIngredientRepository.findByIngredientId(id);
        List<String> suppliers = new ArrayList<>();

        for (SupplierIngredient si : supplierIngredients
        ) {

            Supplier supplier = supplierRepository.findById(si.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));

            suppliers.add(supplier.getRegNo());
        }

        return suppliers;
    }

    public void DeleteIngWithSup(Integer ingId){
        List<SupplierIngredient> supplierIngredients = supplierIngredientRepository.findByIngredientId(ingId);
        for (SupplierIngredient supIng: supplierIngredients
             ) {
            supplierIngredientRepository.deleteById(new SupplierIngredientsId(supIng.getSupplierId(),ingId ));
        }
    }
}
