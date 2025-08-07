package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.AvailabilityResultDTO;
import com.AdwinsCom.AdwinsCom.DTO.IngredientAvailabilityDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Notification;
import com.AdwinsCom.AdwinsCom.entity.User;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;

@Service
public class ProductionItemService implements IProductionItemService {

    final ProductionItemRepository productionItemRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
private INotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public ProductionItemService(ProductionItemRepository productionItemRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository) {
        this.productionItemRepository = productionItemRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Override
    public ModelAndView GetProductionItemUI() {

        ModelAndView productionItemMV = new ModelAndView();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User loggedUser = userRepository.getUserByUserName(auth.getName());

        productionItemMV.addObject("loggedUserName", auth.getName());
        productionItemMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());
        productionItemMV.addObject("loggedUserPhoto", loggedUser.getPhoto()); 
        

        productionItemMV.setViewName("ProductionManagement.html");

        return productionItemMV;
    }

    @Override
    public ResponseEntity<?> CheckIngredientAvailability(String recipeCode, Integer batchSize) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();


        Recipe recipe = recipeRepository.findByRecipeCode(recipeCode);
        List<IngredientAvailabilityDTO> ingredientAvailabilityDTOS = new ArrayList<>();
        AvailabilityResultDTO resultDTO = new AvailabilityResultDTO();

        System.out.println("Checking availability for recipe: " + recipe.getRecipeName() + " with code: " + recipe.getRecipeCode());
        resultDTO.setIsIngAvailable(true);
        double cost = 0.0;
        for (RecipeItem ri : recipe.getRecipeItems()
        ) {
            Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(ri.getIngredientCode());
            Double ingredientStockLevel = 0.0;
            switch (ingredient.getUnitType()){
                case G,ML -> ingredientStockLevel = ingredient.getQuantity() / 1000;
                case KG,L -> ingredientStockLevel = ingredient.getQuantity();
            }

            Double ingRecipeQuantity = 0.0;

            switch (ri.getUnitType()){
                case G,ML -> ingRecipeQuantity = ri.getQty() / 1000;
                case KG,L -> ingRecipeQuantity = ri.getQty();
            }
            IngredientAvailabilityDTO availabilityDTO = new IngredientAvailabilityDTO();
            availabilityDTO.setIngredientCode(ingredient.getIngredientCode());
            availabilityDTO.setIngredientName(ingredient.getIngredientName());
            availabilityDTO.setRequiredQty(ingRecipeQuantity * batchSize);
            availabilityDTO.setUnitType(ingredient.getUnitType().toString());
            if(ingredientStockLevel > (ingRecipeQuantity * batchSize)){
                availabilityDTO.setIsAvailable(true);
                Double avgCost = (ingredient.getAvgCost() != null ? ingredient.getAvgCost() : 0.0);
cost += (ingRecipeQuantity * batchSize) * avgCost;

                // Low stock warning logic: only if stock is below ROP (reorder point)
                if (ingredientStockLevel < ingredient.getRop()) {
                    Notification notification = new Notification();
                    notification.setType("LowStockWarning");
                    String msg = "Low stock warning: " +
                        ingredient.getIngredientName() + " (" + ingredient.getIngredientCode() + ")\n" +
                        "Available: " + ingredientStockLevel + " " + ingredient.getUnitType() + "\n" +
                        "ROP: " + ingredient.getRop() + " " + ingredient.getUnitType() + "\n" +
                        "For Recipe: " + recipe.getRecipeName() + " (" + recipe.getRecipeCode() + ")\n" +
                        LocalDateTime.now() + "\n" + "by" + auth.getName();
                    notification.setMessage(msg);
                    notificationService.saveNotification(notification);
                }
            } else {
                availabilityDTO.setIsAvailable(false);
                resultDTO.setIsIngAvailable(false);

                // Ingredient shortage notification
                Notification notification = new Notification();
                notification.setType("IngredientShortage");
                String msg = "Ingredient shortage: " +
                    ingredient.getIngredientName() + " (" + ingredient.getIngredientCode() + ")\n" +
                    "Required: " + BigDecimal.valueOf(ingRecipeQuantity * batchSize).setScale(2, RoundingMode.HALF_UP)+ " " + ingredient.getUnitType() + "\n" +
                    "Available: " + ingredientStockLevel + " " + ingredient.getUnitType() + "\n" +
                    "For Recipe: " + recipe.getRecipeName() + " (" + recipe.getRecipeCode() + ")\n" +
                    "Time: " + LocalDateTime.now().toString();
                notification.setMessage(msg);
                notificationService.saveNotification(notification);
            }

            ingredientAvailabilityDTOS.add(availabilityDTO);
        }
        resultDTO.setAvailabilityDTOS(ingredientAvailabilityDTOS);
        resultDTO.setTotalCost(cost);
        return ResponseEntity.ok(resultDTO);
    }
}
