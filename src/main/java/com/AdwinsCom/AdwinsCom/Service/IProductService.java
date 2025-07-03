package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.ProductBatchDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductRestockRequestDTO;
import com.AdwinsCom.AdwinsCom.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.NoSuchAlgorithmException;

public interface IProductService {

    ResponseEntity<?> AddNewProduct(ProductBatchDTO dto);
//    ResponseEntity<?> UpdateProduct(Product product) ;
    ResponseEntity<?> GetAllProducts();
    ResponseEntity<?> deleteProduct(Integer productId);
    ResponseEntity<?>restockProduct(ProductRestockRequestDTO request);


}
