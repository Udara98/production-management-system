package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.ModelAndView;

import java.security.NoSuchAlgorithmException;

public interface IProductionItemService {

    ResponseEntity<?> AddNewProductionItem(ProductionItemDTO productionItemDTO) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateProductionItem(ProductionItemDTO productionItemDTO) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllProductionItems();
    ResponseEntity<?> DeleteProductionItem(Integer id);
    ModelAndView GetProductionItemUI();

    ResponseEntity<?> CheckIngredientAvailability(String recipeCode, Integer batchSize);

}
