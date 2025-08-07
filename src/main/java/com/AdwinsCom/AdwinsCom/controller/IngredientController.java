package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IIngredientService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;


@RestController
@RequestMapping(value = "/ingredient")
public class IngredientController {

    @Autowired
    private IIngredientService ingredientService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView supplierModelAndView() {

        //Get authenticated logged user authentication  object using security contest
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //Get authenticated logged user authentication  object using security contest
        User loggedUser = userRepository.getUserByUserName(auth.getName());

        ModelAndView loginView = new ModelAndView();

        ModelAndView ingredientMV = new ModelAndView();
        ingredientMV.setViewName("ingredient.html");
        ingredientMV.addObject("loggedUserName", auth.getName());
        ingredientMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());



        return ingredientMV;
    }

    @PostMapping()
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

    @PutMapping()
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

}
