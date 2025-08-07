package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IProductionItemService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ModelAndView productionItemModel() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedUser = userRepository.getUserByUserName(auth.getName());

        ModelAndView productionItemMV = new ModelAndView();
        productionItemMV.setViewName("productionItem.html");
        productionItemMV.addObject("loggedUserName", loggedUser);
        productionItemMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());

        return productionItemService.GetProductionItemUI();
    }


    @GetMapping("/checkIngAvailability/{recipeCode}/{batchSize}")
    public ResponseEntity<?> CheckIngAvailability(@PathVariable String recipeCode, @PathVariable Integer batchSize ){
        try{
            return productionItemService.CheckIngredientAvailability(recipeCode,batchSize);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

 

}
