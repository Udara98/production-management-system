package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import com.AdwinsCom.AdwinsCom.Service.IIngredientService;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/ingredient")
public class IngredientController {

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private PrivilegeController privilegeController;

    @Autowired
    private IIngredientService ingredientService;

    @GetMapping
    public ModelAndView supplierModelAndView() {
        ModelAndView supplierMV = new ModelAndView();
        supplierMV.setViewName("ingredient.html");
        return supplierMV;
    }

    @PostMapping("/addNewIngredient")
    public ResponseEntity<?> AddNewIngredient(@RequestBody IngredientDTO ingredientDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ingredientService.AddNewIngredient(ingredientDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllIngredients")
    public ResponseEntity<?> GetAllIngredients(){
        try{
            return ingredientService.GetAllIngredients();
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateIngredient")
    public ResponseEntity<?> UpdateIngredient(@RequestBody IngredientDTO ingredientDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ingredientService.UpdateIngredient(ingredientDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteIngredient/{id}")
    public ResponseEntity<?> DeleteIngredient(@PathVariable Integer id){
        try {
            return ingredientService.DeleteIngredient(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

//    @GetMapping(value = "/availblelist", produces = "application/json")
//    public List<Ingredient> getAvailableDataList() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        HashMap<String, Boolean> logUserPrivi = privilegeController.getPrivilegeByUserModule(auth.getName(), "Ingredient");
//
//        if (!logUserPrivi.get("select")) {
//            return null;
//        }
//
//        return ingredientRepository.getAvailableItemList();
//    }
}
