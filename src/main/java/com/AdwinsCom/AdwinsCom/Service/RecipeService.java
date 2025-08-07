package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.FlavourRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeRepository;
import com.AdwinsCom.AdwinsCom.entity.Production.Flavour;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import com.AdwinsCom.AdwinsCom.DTO.RecipeDTO;
import com.AdwinsCom.AdwinsCom.DTO.RecipeItemDTO;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecipeService implements IRecipeService{

    final RecipeRepository recipeRepository;
    final ProductionItemRepository productionItemRepository;
    final FlavourRepository flavourRepository;

    public RecipeService(RecipeRepository recipeRepository, ProductionItemRepository productionItemRepository, FlavourRepository flavourRepository) {
        this.recipeRepository = recipeRepository;
        this.productionItemRepository = productionItemRepository;
        this.flavourRepository = flavourRepository;
    }

    private String findMaxRecipeCode(){
        int maxNumber = 1;
        String maxRecipeCode = recipeRepository.findMaxRecipeCode();

        if(maxRecipeCode != null && maxRecipeCode.startsWith("RECI-")){
            maxNumber = Integer.parseInt(maxRecipeCode.substring(5));
        }
            
        return String.format("RECI-%04d", maxNumber + 1);
    }

    // DTO-based add method (not interface method)
    public ResponseEntity<?> AddNewRecipe(RecipeDTO recipeDTO, String userName) throws NoSuchAlgorithmException {
        Recipe recipe = new Recipe();
        recipe.setRecipeCode(findMaxRecipeCode());
        recipe.setRecipeName(recipeDTO.getRecipeName());
        recipe.setStatus(recipeDTO.getStatus() != null ? Recipe.RecipeStatus.valueOf(recipeDTO.getStatus()) : null);
        recipe.setAddedUser(userName);
        recipe.setAddedDate(LocalDateTime.now());
       
        System.out.println("Flavour ID from DTO: " + recipeDTO.getFlavourId());
        Flavour flavour = flavourRepository.cusFindFlavourById(recipeDTO.getFlavourId());
        recipe.setFlavour(flavour);
        System.out.println("Flavour ID set on Recipe: " + (flavour != null ? flavour.getId() : "null"));

        System.out.println("Flavour from repo: " + flavour);


        // Map recipe items if present (assumes RecipeItemDTO to RecipeItem conversion)
        if (recipeDTO.getRecipeItems() != null) {
            List<RecipeItem> items = new java.util.ArrayList<>();
            for (RecipeItemDTO dto : recipeDTO.getRecipeItems()) {
                RecipeItem item = new RecipeItem();
                item.setIngredientCode(dto.getIngredientCode());
                item.setIngredientName(dto.getIngredientName());
                item.setQty(dto.getQty() != null ? dto.getQty().doubleValue() : null);
                item.setUnitType(dto.getUnitType() != null ? com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType.valueOf(dto.getUnitType()) : null);
                items.add(item);
            }
            recipe.setRecipeItems(items);
        }

        recipeRepository.save(recipe);
        return ResponseEntity.ok("Recipe Added");
    }



    @Override
    public ResponseEntity<?> UpdateRecipe(Recipe recipe, String userName){

        recipe.setUpdatedUser(userName);
        recipe.setUpdatedDate(LocalDateTime.now());
        recipeRepository.save(recipe);

        return ResponseEntity.ok("Recipe Updated");
    }

    @Override
    public ResponseEntity<?> GetAllRecipes() {
        List<Recipe> recipes = recipeRepository.findAll();
        return ResponseEntity.ok(recipes);
    }

    @Override
    @Transactional
    public ResponseEntity<?> DeleteRecipe(String id) {
        Recipe recipe = recipeRepository.findByRecipeCode(id);
        List<ProductionItem> productionItems = productionItemRepository.findByRecipeCode(id);

        for (ProductionItem pi: productionItems
        ) {
            pi.setRecipeCode("Removed");
            pi.setStatus(ProductionItem.ProductionItemStatus.InActive);
            productionItemRepository.save(pi);
        }
        recipeRepository.deleteById(recipe.getId());
        return ResponseEntity.ok("Recipe Deleted");
    }
}
