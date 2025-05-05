package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.ProductHasBatchRepository;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductHasBatchService implements  IProductHasBatchService{

    final ProductHasBatchRepository productHasBatchRepository;


    public  ProductHasBatchService (ProductHasBatchRepository productHasBatchRepository) {
        this.productHasBatchRepository = productHasBatchRepository;
    }

    @Override
    public ResponseEntity<?> GetAll() {
        List<ProductHasBatch> products = productHasBatchRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @Override
    public ResponseEntity<?> getProductHasBatchByProductId(Integer productId) {
        try {
            List<ProductHasBatch> productHasBatches = productHasBatchRepository.findAllByProductId(productId);
            return ResponseEntity.ok(productHasBatches);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }




}
