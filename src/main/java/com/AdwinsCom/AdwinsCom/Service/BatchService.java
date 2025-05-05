package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class BatchService implements IBatchService{

    final BatchRepository batchRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;
    final ProductHasBatchRepository productHasBatchRepository;


    public BatchService(BatchRepository batchRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository, ProductHasBatchRepository productHasBatchRepository) {
        this.batchRepository = batchRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.productHasBatchRepository = productHasBatchRepository;
    }



    @Override
    @Transactional
    public ResponseEntity<?> AddNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException {
        Batch newBatch = new Batch().mapDTO(null,batchDTO,userName);

        Recipe recipe = recipeRepository.findByRecipeCode(batchDTO.getRecipeCode());

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

    @Override
    public ResponseEntity<?> getRecipeCodeFromProduct(Integer productId) {
        ProductHasBatch productHasBatch = productHasBatchRepository.findFirstByProductId(productId)
                .orElseThrow(() -> new RuntimeException("No ProductHasBatch found for product ID: " + productId));

        // Assuming that the ProductHasBatch entity has a relationship with Batch
        if (productHasBatch != null && productHasBatch.getBatch() != null) {
            return ResponseEntity.ok(productHasBatch.getBatch().getRecipeCode());
        } else {
            throw new RuntimeException("No batch found for this product.");
        }
    }

    @Override
    public ResponseEntity<?> getBatchesForProduct(Integer productId, boolean fifo) {

        // First, get the recipe code from the product
        ResponseEntity<?> recipeCodeResponse = getRecipeCodeFromProduct(productId);

        if (recipeCodeResponse.getStatusCode().is2xxSuccessful() && recipeCodeResponse.getBody() != null) {
            String recipeCode = recipeCodeResponse.getBody().toString();

            List<Batch> batches;
            if (fifo) {
                batches = batchRepository.findByRecipeCodeOrderByManufactureDateAsc(recipeCode);
            } else {
                batches = batchRepository.findByRecipeCodeOrderByManufactureDateDesc(recipeCode);
            }

            return ResponseEntity.ok(batches);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipe code not found for the product.");
        }
    }


    @Override
    public ResponseEntity<?> getBatchNoById(Integer batchId) {
        try {
            String batchNo = batchRepository.findBatchNoById(batchId);
            if (batchNo != null) {
                return ResponseEntity.ok(batchNo);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Batch not found for the given ID.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }




}
