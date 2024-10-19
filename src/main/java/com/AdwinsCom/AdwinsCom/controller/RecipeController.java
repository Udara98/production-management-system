package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Service.IRecipeService;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/recipe")
public class RecipeController {

    final IRecipeService recipeService;

    public RecipeController(IRecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/addNewRecipe")
    public ResponseEntity<?> AddNewRecipe(@RequestBody Recipe recipe) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return recipeService.AddNewRecipe(recipe, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllRecipes")
    private ResponseEntity<?> GetAllRecipes() {
        try {
            return recipeService.GetAllRecipes();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateRecipe")
    public ResponseEntity<?> UpdateRecipe(@RequestBody Recipe recipe) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return recipeService.UpdateRecipe(recipe, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteRecipe/{rCode}")
    public ResponseEntity<?> DeleteRecipe(@PathVariable String rCode){
        try {
            return recipeService.DeleteRecipe(rCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

}
