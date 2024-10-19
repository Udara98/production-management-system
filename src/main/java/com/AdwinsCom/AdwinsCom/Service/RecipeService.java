package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeRepository;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
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

    public RecipeService(RecipeRepository recipeRepository, ProductionItemRepository productionItemRepository) {
        this.recipeRepository = recipeRepository;
        this.productionItemRepository = productionItemRepository;
    }

    @Override
    public ResponseEntity<?> AddNewRecipe(Recipe recipe, String userName) throws NoSuchAlgorithmException {
        recipe.setRecipeCode(QuotationRequest.generateUniqueId("REC-"));
        recipe.setAddedUser(userName);
        recipe.setAddedDate(LocalDateTime.now());

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
