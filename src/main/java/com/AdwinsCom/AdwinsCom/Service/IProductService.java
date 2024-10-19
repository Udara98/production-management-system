package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.NoSuchAlgorithmException;

public interface IProductService {

    ResponseEntity<?> AddNewProduct(Product product, String userName, Integer batchId, MultipartFile file) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateProduct(Product product, String userName, Integer batchId, MultipartFile file) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllProducts();

}
