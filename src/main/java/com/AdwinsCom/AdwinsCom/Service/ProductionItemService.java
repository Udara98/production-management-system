package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.AvailabilityResultDTO;
import com.AdwinsCom.AdwinsCom.DTO.IngredientAvailabilityDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class ProductionItemService implements IProductionItemService {

    final ProductionItemRepository productionItemRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public ProductionItemService(ProductionItemRepository productionItemRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository) {
        this.productionItemRepository = productionItemRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Override
    public ResponseEntity<?> AddNewProductionItem(ProductionItemDTO productionItemDTO) throws NoSuchAlgorithmException {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCTION_ITEM");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Production Item Adds not Completed: You don't have permission!");
        }

        ProductionItem newProductionItem = new ProductionItem().mapDTO(null, productionItemDTO, auth.getName());
        productionItemRepository.save(newProductionItem);

        return ResponseEntity.ok("Production Item Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateProductionItem(ProductionItemDTO productionItemDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCTION_ITEM");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("update")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Production Item update not Completed: You don't have permission!");
        }

        ProductionItem productionItem = productionItemRepository.findById(productionItemDTO.getId()).get();
        ProductionItem updateItem = new ProductionItem().mapDTO(productionItem,productionItemDTO, auth.getName());
        productionItemRepository.save(updateItem);

        return ResponseEntity.ok("Production Item Updated Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllProductionItems() {
        List<ProductionItem> productionItems = productionItemRepository.findByStatusNotRemoved();
        return ResponseEntity.ok(productionItems);
    }

    @Override
    public ResponseEntity<?> DeleteProductionItem(Integer id) {
       ProductionItem productionItem=productionItemRepository.findById(id).get();
       productionItem.setStatus(ProductionItem.ProductionItemStatus.Removed);
       productionItemRepository.save(productionItem);

        return ResponseEntity.ok("Production Item Deleted Successfully");
    }

    @Override
    public ResponseEntity<?> CheckIngredientAvailability(String recipeCode, Integer batchSize) {

        Recipe recipe = recipeRepository.findByRecipeCode(recipeCode);
        List<IngredientAvailabilityDTO> ingredientAvailabilityDTOS = new ArrayList<>();
        AvailabilityResultDTO resultDTO = new AvailabilityResultDTO();
        resultDTO.setIsIngAvailable(true);
        double cost = 0.0;
        for (RecipeItem ri : recipe.getRecipeItems()
        ) {
            Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(ri.getIngredientCode());
            Double ingredientStockLevel = 0.0;
            switch (ingredient.getUnitType()){
                case G,ML -> ingredientStockLevel = ingredient.getQuantity() / 1000;
                case KG,L -> ingredientStockLevel = ingredient.getQuantity();
            }

            Double ingRecipeQuantity = 0.0;

            switch (ri.getUnitType()){
                case G,ML -> ingRecipeQuantity = ri.getQty() / 1000;
                case KG,L -> ingRecipeQuantity = ri.getQty();
            }
            IngredientAvailabilityDTO availabilityDTO = new IngredientAvailabilityDTO();
            availabilityDTO.setIngredientCode(ingredient.getIngredientCode());
            availabilityDTO.setIngredientName(ingredient.getIngredientName());
            if(ingredientStockLevel > (ingRecipeQuantity * batchSize)){
                availabilityDTO.setIsAvailable(true);
                cost += (ingRecipeQuantity * batchSize)*ingredient.getAvgCost();
            }else {
                availabilityDTO.setIsAvailable(false);
                resultDTO.setIsIngAvailable(false);
            }

            ingredientAvailabilityDTOS.add(availabilityDTO);
        }
        resultDTO.setAvailabilityDTOS(ingredientAvailabilityDTOS);
        resultDTO.setTotalCost(cost);
        return ResponseEntity.ok(resultDTO);
    }
}
