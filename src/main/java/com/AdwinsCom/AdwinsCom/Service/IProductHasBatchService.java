package com.AdwinsCom.AdwinsCom.Service;

import org.springframework.http.ResponseEntity;

public interface IProductHasBatchService {

    ResponseEntity<?> GetAll();

    ResponseEntity<?>  getProductHasBatchByProductId(Integer productId);
}
