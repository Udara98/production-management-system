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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductionItemService implements IProductionItemService {

    final ProductionItemRepository productionItemRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;

    public ProductionItemService(ProductionItemRepository productionItemRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository) {
        this.productionItemRepository = productionItemRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Override
    public ResponseEntity<?> AddNewProductionItem(ProductionItemDTO productionItemDTO, String userName) throws NoSuchAlgorithmException {

        ProductionItem newProductionItem = new ProductionItem().mapDTO(null, productionItemDTO, userName);
        productionItemRepository.save(newProductionItem);

        return ResponseEntity.ok("Production Item Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateProductionItem(ProductionItemDTO productionItemDTO, String userName) throws NoSuchAlgorithmException {

        ProductionItem productionItem = productionItemRepository.findById(productionItemDTO.getId()).get();
        ProductionItem updateItem = new ProductionItem().mapDTO(productionItem,productionItemDTO,userName);
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
