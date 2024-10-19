package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import com.AdwinsCom.AdwinsCom.Repository.BatchRepository;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.Repository.RecipeRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class BatchService implements IBatchService{

    final BatchRepository batchRepository;
    final ProductionItemRepository productionItemRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;
    public BatchService(BatchRepository batchRepository, ProductionItemRepository productionItemRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository) {
        this.batchRepository = batchRepository;
        this.productionItemRepository = productionItemRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Override
    @Transactional
    public ResponseEntity<?> AddNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException {
        Batch newBatch = new Batch().mapDTO(null,batchDTO,userName);

        ProductionItem productionItem = productionItemRepository.findByProductionItemNo(batchDTO.getProductionItemNo());
        Recipe recipe = recipeRepository.findByRecipeCode(productionItem.getRecipeCode());

        for (RecipeItem ri: recipe.getRecipeItems()
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

            ingredient.setQuantity(ingredientStockLevel-(ingRecipeQuantity*batchDTO.getTotalQuantity()));

            ingredientRepository.save(ingredient);
        }

        batchRepository.save(newBatch);

        return ResponseEntity.ok("New Batch Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException {
        Batch batch = batchRepository.findById(batchDTO.getId()).get();
        Batch updatedBatch = new Batch().mapDTO(batch,batchDTO,userName);

        batchRepository.save(updatedBatch);
        return ResponseEntity.ok("Batch Updated Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllBatches() {
        List<Batch> batchList = batchRepository.findByBatchStatusNotRemoved();
        return ResponseEntity.ok(batchList);
    }

    @Override
    public ResponseEntity<?> DeleteBatch(Integer id) {
        Batch batch = batchRepository.findById(id).get();
        batch.setBatchStatus(Batch.BatchStatus.Removed);
        batchRepository.save(batch);
        return ResponseEntity.ok("Batch Deleted Successfully");

    }
}
