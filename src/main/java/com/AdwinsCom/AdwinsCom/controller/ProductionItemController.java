package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import com.AdwinsCom.AdwinsCom.Service.IProductionItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/productionItem")
public class ProductionItemController {

    final IProductionItemService productionItemService;

    public ProductionItemController(IProductionItemService productionItemService) {
        this.productionItemService = productionItemService;
    }

    @GetMapping
    public ModelAndView productionItemModel() {

        ModelAndView productionItemMV = new ModelAndView();
        productionItemMV.setViewName("ProductionManagement.html");
        return productionItemMV;
    }

    @PostMapping()
    public ResponseEntity<?> AddNewProductionItem(@RequestBody ProductionItemDTO productionItemDTO){
        try {
            return productionItemService.AddNewProductionItem(productionItemDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllPIs")
    public ResponseEntity<?> GetAllProductionItems() {
        try {
            return productionItemService.GetAllProductionItems();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/checkIngAvailability/{recipeCode}/{batchSize}")
    public ResponseEntity<?> CheckIngAvailability(@PathVariable String recipeCode, @PathVariable Integer batchSize ){
        try{
            return productionItemService.CheckIngredientAvailability(recipeCode,batchSize);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping()
    public ResponseEntity<?> UpdatePI(@RequestBody ProductionItemDTO productionItemDTO){
        try {
            return productionItemService.UpdateProductionItem(productionItemDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deletePI/{id}")
    public ResponseEntity<?> DeletePI(@PathVariable Integer id){
        try{
            return productionItemService.DeleteProductionItem(id);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

}
