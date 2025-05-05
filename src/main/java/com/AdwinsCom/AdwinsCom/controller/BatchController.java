package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import com.AdwinsCom.AdwinsCom.Service.IBatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/batch")
public class BatchController {

    final IBatchService batchService;

    public BatchController(IBatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping("/addNewBatch")
    public ResponseEntity<?> AddNewBatch(@RequestBody BatchDTO batchDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return batchService.AddNewBatch(batchDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllBatches")
    public ResponseEntity<?> GetAllBatches(){
        try {
            return batchService.GetAllBatches();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateBatch")
    public ResponseEntity<?> UpdateBatch(@RequestBody BatchDTO batchDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return batchService.UpdateNewBatch(batchDTO, auth.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteBatch/{id}")
    public ResponseEntity<?> DeleteBatch(@PathVariable Integer id){
        try {
            return batchService.DeleteBatch(id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getBatchesForProduct/{productId}/{fifo}")
    public ResponseEntity<?> getBatchesForProduct(
            @PathVariable Integer productId,
            @PathVariable boolean fifo) {
        try {
            return batchService.getBatchesForProduct(productId, fifo);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getBatchNo/{id}")
    public ResponseEntity<?> getBatchNo(@PathVariable Integer id) {
        return batchService.getBatchNoById(id);
    }

}
