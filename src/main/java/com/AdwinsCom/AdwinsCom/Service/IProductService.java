package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.NoSuchAlgorithmException;

public interface IProductService {

    ResponseEntity<?> AddNewProduct(Product product);
    ResponseEntity<?> UpdateProduct(Product product) ;
    ResponseEntity<?> GetAllProducts();

}
