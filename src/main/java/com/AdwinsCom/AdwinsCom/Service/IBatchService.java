package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IBatchService {
    ResponseEntity<?> AddNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateNewBatch(BatchDTO batchDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllBatches();
    ResponseEntity<?> DeleteBatch(Integer id);
    ResponseEntity<?> getRecipeCodeFromProduct(Integer id);
    ResponseEntity<?> getBatchesForProduct(Integer id,boolean fifo);
    ResponseEntity<?> getBatchNoById(Integer id);
}
