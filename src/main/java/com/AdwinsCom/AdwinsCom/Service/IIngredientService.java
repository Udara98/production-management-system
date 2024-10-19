package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import org.springframework.http.ResponseEntity;

public interface IIngredientService {

    public ResponseEntity<?> AddNewIngredient(IngredientDTO ingredientDTO, String userName);
    public ResponseEntity<?> GetAllIngredients();
    public ResponseEntity<?> UpdateIngredient(IngredientDTO ingredientDTO, String userName);
    public ResponseEntity<?> DeleteIngredient(Integer id);
}
