package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierWithIngredientsDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierIngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

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

    @Override
    @Transactional
    public ResponseEntity<?> AddNewSupplier(SupplierDTO supplierDTO, String userName) {
        Supplier supplier = supplierRepository.getSupplierByRegNo(supplierDTO.getRegNo());
        if (supplier != null) {
            return ResponseEntity.badRequest().body("Supplier Already Exist");
        }

        Supplier newSupplier = new Supplier().mapDTO(null, supplierDTO, userName);

        mapIngredients(supplierDTO, newSupplier);
        return ResponseEntity.ok("Supplier Registered Successfully");
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
    public ResponseEntity<?> DeleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id).get();
        supplier.setSupplierStatus(Supplier.SupplierStatus.Removed);
        supplierRepository.save(supplier);

        return ResponseEntity.ok("Supplier Removed Successfully");
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
