package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IngredientService implements IIngredientService {


    final IngredientRepository ingredientRepository;
    final SupplierService supplierService;
    final QuotationRequestRepository quotationRequestRepository;

    public IngredientService(IngredientRepository ingredientRepository, SupplierService supplierService, QuotationRequestRepository quotationRequestRepository) {
        this.ingredientRepository = ingredientRepository;
        this.supplierService = supplierService;
        this.quotationRequestRepository = quotationRequestRepository;
    }

    @Override
    public ResponseEntity<?> AddNewIngredient(IngredientDTO ingredientDTO, String userName) {

        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(ingredientDTO.getIngredientCode());
        if (ingredient != null) {
            return ResponseEntity.badRequest().body("Duplicate entry for Ingredient Code : " + ingredientDTO.getIngredientCode());
        }
        Ingredient newIngredient = new Ingredient().mapDTO(null, ingredientDTO, userName);
        ingredientRepository.save(newIngredient);
        return ResponseEntity.ok("Ingredient Added Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllIngredients() {
        List<Ingredient> ingredientList = ingredientRepository.findAllByStatusNotRemoved();
        return ResponseEntity.ok(ingredientList);
    }

    @Override
    public ResponseEntity<?> UpdateIngredient(IngredientDTO ingredientDTO, String userName) {
        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(ingredientDTO.getIngredientCode());

        Ingredient updatedIngredient = new Ingredient().mapDTO(ingredient, ingredientDTO, userName);

        ingredientRepository.save(updatedIngredient);
        return ResponseEntity.ok("Ingredient Updated Successfully");
    }

    @Override
    @Transactional
    public ResponseEntity<?> DeleteIngredient(Integer id) {
        List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(id);
        Ingredient ingredient = ingredientRepository.findById(id).get();
        boolean hasActiveQuotations=false;
        for (QuotationRequest qReq : quotationRequests
        ) {
            if (qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send) {
                hasActiveQuotations = true;
                break;
            }
        }
        if(hasActiveQuotations){
            return ResponseEntity.badRequest().body("Can't Delete this Ingredient. There is an Active Quotation Request.");
        }else {
            ingredient.setIngredientStatus(Ingredient.IngredientStatus.Removed);
            ingredientRepository.save(ingredient);
            supplierService.RemoveIngFromSuppliers(id);
        }
        return ResponseEntity.ok("Ingredient Deleted Successfully");
    }

    public Ingredient GetIngredient(Integer id) {
        return ingredientRepository.findById(id).get();
    }
}