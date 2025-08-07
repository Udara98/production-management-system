package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import com.AdwinsCom.AdwinsCom.DTO.BatchProductionReportDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentReportDTO;

import java.util.ArrayList;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.List;

@Service
public class BatchService implements IBatchService{

    final BatchRepository batchRepository;
    final RecipeRepository recipeRepository;
    final IngredientRepository ingredientRepository;
    final ProductHasBatchRepository productHasBatchRepository;
    final SupplierPaymentHasGoodReceiveNoteService supplierPaymentHasGoodReceiveNoteService;

    public BatchService(BatchRepository batchRepository, RecipeRepository recipeRepository, IngredientRepository ingredientRepository, ProductHasBatchRepository productHasBatchRepository, SupplierPaymentHasGoodReceiveNoteService supplierPaymentHasGoodReceiveNoteService) {
        this.batchRepository = batchRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.productHasBatchRepository = productHasBatchRepository;
        this.supplierPaymentHasGoodReceiveNoteService = supplierPaymentHasGoodReceiveNoteService;
    }



    private String getMaxBatchNo(){

        int maxNo = 1;
        String maxBatchNo = batchRepository.findMaxBatchNo();

        if (maxBatchNo !=null && maxBatchNo.startsWith("BCH-")){
            maxNo = Integer.parseInt(maxBatchNo.substring(4)) + 1;
        }

        return String.format("BCH-%04d", maxNo);
    }



    @Override
    @Transactional
    public ResponseEntity<?> AddNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException {
        // Manually map fields from DTO to entity (no mapDTO)
        Batch newBatch = new Batch();
        newBatch.setBatchNo(getMaxBatchNo()); // Replace with sequential if needed
        newBatch.setRecipeCode(batchDTO.getRecipeCode());
        newBatch.setRecipeName(batchDTO.getRecipeName());
        newBatch.setTotalQuantity(batchDTO.getTotalQuantity());
        newBatch.setDamagedQuantity(batchDTO.getDamagedQuantity());
        newBatch.setAvailableQuantity(batchDTO.getTotalQuantity());
        newBatch.setManufactureDate(batchDTO.getManufactureDate());
        newBatch.setExpireDate(batchDTO.getExpireDate());
        newBatch.setTotalCost(batchDTO.getTotalCost());
        newBatch.setBatchStatus(batchDTO.getBatchStatus());
        newBatch.setNote(batchDTO.getNote());
        newBatch.setAddedUser(userName);
        newBatch.setAddedDate(java.time.LocalDateTime.now());

        Recipe recipe = recipeRepository.findByRecipeCode(batchDTO.getRecipeCode());
        newBatch.setFlavourId(recipe.getFlavour().getId());

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
        // Manually map fields for update (no mapDTO)
        batch.setRecipeCode(batchDTO.getRecipeCode());
        batch.setRecipeName(batchDTO.getRecipeName());
        batch.setTotalQuantity(batchDTO.getTotalQuantity());
        batch.setAvailableQuantity(batchDTO.getAvailableQuantity());
        batch.setDamagedQuantity(batchDTO.getDamagedQuantity());
        batch.setManufactureDate(batchDTO.getManufactureDate());
        batch.setExpireDate(batchDTO.getExpireDate());
        batch.setTotalCost(batchDTO.getTotalCost());
        batch.setBatchStatus(batchDTO.getBatchStatus());
        batch.setNote(batchDTO.getNote());
        batch.setUpdatedUser(userName);
        batch.setUpdatedDate(java.time.LocalDateTime.now());
        batchRepository.save(batch);
        return ResponseEntity.ok("Batch Updated Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllBatches() {
        List<Batch> batchList = batchRepository.findByBatchStatusNotRemoved();
        return ResponseEntity.ok(batchList);
    }

    @Override
    public ResponseEntity<?> GetAllDoneBatches() {
        List<Batch> batchList = batchRepository.findByBatchStatusProductionDone();
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
    public ResponseEntity<?> getBatchesForProduct(Integer productId) {

        try{

            ResponseEntity<?> recipeCodeResponse = getRecipeCodeFromProduct(productId);

            String recipeCode = recipeCodeResponse.getBody().toString();

            if (recipeCode.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Empty recipe code returned for product ID: " + productId);
            }

            List<Batch> batches = batchRepository.findProductionDoneBatchesByRecipeCodeOrderByManufactureDateAsc(recipeCode);

            if (batches == null || batches.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
    

            return ResponseEntity.ok(batches);

        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
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


    public List<BatchProductionReportDTO> getBatchProductionReportByDateRange(java.time.LocalDateTime start, java.time.LocalDateTime end) {
        
        
        List<Object[]> rows = batchRepository.getBatchProductionReportByDateRange(start, end);
        return mapRowsToDTO(rows);
    }

    private List<BatchProductionReportDTO> mapRowsToDTO(List<Object[]> rows) {
        List<BatchProductionReportDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            BatchProductionReportDTO dto = new BatchProductionReportDTO();
            dto.setBatchNo(row[0] != null ? row[0].toString() : null);
            dto.setTotalQuantity(row[1] != null ? Double.valueOf(row[1].toString()) : null);
            dto.setAvailableQuantity(row[2] != null ? Double.valueOf(row[2].toString()) : null);
            dto.setDamagedQuantity(row[3] != null ? Double.valueOf(row[3].toString()) : null);
            dto.setTotalCost(row[4] != null ? Double.valueOf(row[4].toString()) : null);
            result.add(dto);
        }
        return result;
    }



    public java.util.List<SupplierPaymentReportDTO> getSupplierPaymentReportByDateRange(LocalDate startDate, LocalDate endDate) {
        return supplierPaymentHasGoodReceiveNoteService.getSupplierPaymentReportByDateRange(startDate, endDate);
    }

}

