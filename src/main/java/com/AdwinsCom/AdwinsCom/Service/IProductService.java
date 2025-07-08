package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.ProductBatchDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductRestockRequestDTO;
import org.springframework.http.ResponseEntity;

public interface IProductService {

    ResponseEntity<?> AddNewProduct(ProductBatchDTO dto);
   ResponseEntity<?> UpdateProduct(ProductBatchDTO dto) ;
    ResponseEntity<?> GetAllProducts();
    ResponseEntity<?> deleteProduct(Integer productId);
    ResponseEntity<?>restockProduct(ProductRestockRequestDTO request);


}
