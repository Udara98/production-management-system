package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IProductionItemService {

    ResponseEntity<?> AddNewProductionItem(ProductionItemDTO productionItemDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateProductionItem(ProductionItemDTO productionItemDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllProductionItems();
    ResponseEntity<?> DeleteProductionItem(Integer id);

    ResponseEntity<?> CheckIngredientAvailability(String recipeCode, Integer batchSize);

}
