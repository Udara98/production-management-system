package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.RecipeDTO;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IRecipeService {

    ResponseEntity<?> AddNewRecipe(RecipeDTO recipeDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateRecipe(Recipe recipe, String userName);
    ResponseEntity<?> GetAllRecipes();
    ResponseEntity<?> DeleteRecipe(String id);

}
