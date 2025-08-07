package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeItemRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import com.AdwinsCom.AdwinsCom.entity.Ingredient.IngredientStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;

@Service
public class IngredientService implements IIngredientService {


    final IngredientRepository ingredientRepository;
    final SupplierService supplierService;
    final RecipeItemRepository recipeItemRepository;
    final QuotationRequestRepository quotationRequestRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public IngredientService(IngredientRepository ingredientRepository, SupplierService supplierService, QuotationRequestRepository quotationRequestRepository, RecipeItemRepository recipeItemRepository) {
        this.ingredientRepository = ingredientRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.supplierService = supplierService;
        this.quotationRequestRepository = quotationRequestRepository;
    }

    @Override
    public ResponseEntity<?> AddNewIngredient(IngredientDTO ingredientDTO, String userName) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "INGREDIENT");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Ingredient Adds not Completed: You don't have permission!");
        }

        Ingredient newIngredient = new Ingredient();

        if(ingredientRepository.existsByIngredientName(ingredientDTO.getIngredientName().trim())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Ingredient Name Already Exists");
        }
        newIngredient.setIngredientCode(ingredientDTO.getIngredientCode());
        newIngredient.setIngredientName(ingredientDTO.getIngredientName());
        newIngredient.setNote(ingredientDTO.getNote());
        newIngredient.setQuantity(ingredientDTO.getQuantity());
        newIngredient.setIngredientStatus(IngredientStatus.InStock);
        newIngredient.setUnitType(ingredientDTO.getUnitType());
        newIngredient.setRop(ingredientDTO.getRop());
        newIngredient.setRoq(ingredientDTO.getRoq());
        newIngredient.setAvgCost(ingredientDTO.getAvgCost());
        newIngredient.setAddedUser(auth.getName());
        newIngredient.setAddedDate(java.time.LocalDateTime.now());
        if (newIngredient.getIngredientCode() == null || newIngredient.getIngredientCode().isEmpty()) {
            newIngredient.setIngredientCode(getNextIngredientCode());
        }
        ingredientRepository.save(newIngredient);
        return ResponseEntity.ok("Ingredient Added Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllIngredients() {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "INGREDIENT");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("select")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Ingredient GetAll not Completed: You don't have permission!");
         }

        List<Ingredient> ingredientList = ingredientRepository.findAllByStatusNotRemoved();
        return ResponseEntity.ok(ingredientList);
    }

    @Override
    public ResponseEntity<?> UpdateIngredient(IngredientDTO ingredientDTO, String userName) {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "INGREDIENT");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("update")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Ingredient Update not Completed: You don't have permission!");
         }

        Ingredient dbIngredient = ingredientRepository.getIngredientByIngredientCode(ingredientDTO.getIngredientCode());
        if (dbIngredient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Ingredient not found with code: " + ingredientDTO.getIngredientCode());
        }
        dbIngredient.setIngredientName(ingredientDTO.getIngredientName());
        dbIngredient.setNote(ingredientDTO.getNote());
        dbIngredient.setQuantity(ingredientDTO.getQuantity());
        dbIngredient.setUnitType(ingredientDTO.getUnitType());
        dbIngredient.setRop(ingredientDTO.getRop());
        dbIngredient.setRoq(ingredientDTO.getRoq());
        dbIngredient.setAvgCost(ingredientDTO.getAvgCost());
        dbIngredient.setUpdatedUser(userName);
        dbIngredient.setUpdatedDate(java.time.LocalDateTime.now());
        ingredientRepository.save(dbIngredient);
        return ResponseEntity.ok("Ingredient Updated Successfully");
    }

    @Override
    @Transactional
    public ResponseEntity<?> DeleteIngredient(Integer id) {

         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "INGREDIENT");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("delete")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Ingredient Delete not Completed: You don't have permission!");
         }

        Ingredient ingredient = ingredientRepository.findById(id).orElse(null);
        if (ingredient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Ingredient not found with ID: " + id);
        }


        // Check if the ingredient is associated with any recipe
        boolean isIngredientInRecipe = recipeItemRepository.existsByIngredientCode(ingredient.getIngredientCode());
        if (isIngredientInRecipe) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Cannot delete ingredient as it is associated with a recipe.");
        }


        List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(id);
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

    public String getNextIngredientCode() {
        String maxCode = ingredientRepository.getMaxIngredientCode(); // e.g. "ING-0023"
        int nextNumber = 1;
        if (maxCode != null && maxCode.startsWith("ING-")) {
            nextNumber = Integer.parseInt(maxCode.substring(4)) + 1;
        }
        return String.format("ING-%04d", nextNumber);
    }
}