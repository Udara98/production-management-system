package com.AdwinsCom.AdwinsCom.Service;
import java.util.HashMap;
import java.util.Objects;

import com.AdwinsCom.AdwinsCom.Repository.BatchRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService implements IProductService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    @Transactional
    public ResponseEntity<?> AddNewProduct(Product product) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Product Adds not Completed: You don't have permission!");
        }

        // Check if product batch is null
        if (product.getBatch() == null || product.getBatch().getId() == null) {
            return ResponseEntity.badRequest().body("Product batch is required and cannot be null.");
        }

        Batch selectedBatch = batchRepository.findById(product.getBatch().getId()).orElse(null);

        // Validate if selectedBatch exists
        if (selectedBatch == null) {
            return ResponseEntity.badRequest().body("Selected batch does not exist.");
        }

        Double unitSize = product.getUnitSize();
        if (product.getUnitType() == ProductUnitType.ML) {
            unitSize = product.getUnitSize() / 1000;
        }

        // Check if batch quantity is sufficient
        if (selectedBatch.getAvailableQuantity() < (unitSize * product.getQuantity())) {
            return ResponseEntity.badRequest().body("Can't Make " + product.getQuantity() + " Items. Batch quantity is insufficient.");
        } else {
            selectedBatch.setAvailableQuantity(selectedBatch.getAvailableQuantity() - (unitSize * product.getQuantity()));
            batchRepository.save(selectedBatch);
        }

        // Additional file handling code here if needed

        product.setBatch(selectedBatch);

        try {
            product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
        } catch (NoSuchAlgorithmException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating unique product code.");
        }

        product.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
        product.setAddedDate(LocalDateTime.now());

        productRepository.save(product);

        return ResponseEntity.ok("Product Added Successfully");
    }

//    public ResponseEntity<?> AddNewProduct(Product product)  {
//
//        // Authentication and authorization
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//
//        // Get privileges for the logged-in user
//        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");
//
//        // If user doesn't have "insert" permission, return 403 Forbidden
//        if (!loguserPrivi.get("insert")) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body("Product Adds not Completed: You don't have permission!");
//        }
//
//
//        Batch seletedBatch = batchRepository.findById(product.getBatch().getId()).orElse(null);
//
//        Double unitSize = product.getUnitSize();
//        if(product.getUnitType() == ProductUnitType.ML){
//            unitSize = product.getUnitSize()/1000;
//        }
//
//        if(seletedBatch.getAvailableQuantity() < ( unitSize*product.getQuantity())){
//            return ResponseEntity.badRequest().body("Can't Make "+product.getQuantity()+" Items. Batch quantity is insufficient.");
//        }else {
//            seletedBatch.setAvailableQuantity(seletedBatch.getAvailableQuantity()-( unitSize*product.getQuantity()));
//            batchRepository.save(seletedBatch);
//        }
//
//
////        if (!file.isEmpty()) {
////            try {
////                File uploadDirFile = new File(uploadDir);
////                if (!uploadDirFile.exists()) {
////                    uploadDirFile.mkdirs();
////                }
////
////                String originalFilename = file.getOriginalFilename();
////                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
////                Path filePath = Paths.get(uploadDir, uniqueFilename);
////
////                Files.write(filePath, file.getBytes());
////                photoPath = "/productimages/"+uniqueFilename;
////
////            } catch (IOException e) {
////                e.printStackTrace();
////                return ResponseEntity.status(500).body("response");
////            }
////        }
//
//        product.setBatch(seletedBatch);
//        product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
//        product.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
//        product.setAddedDate(LocalDateTime.now());
//
//        productRepository.save(product);
//
//        return ResponseEntity.ok("Product Added Successfully");
//    }

    @Override
    public ResponseEntity<?> UpdateProduct(Product product)  {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("update")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Product update not Completed: You don't have permission!");
        }

        String photoPath = "";
        Batch seletedBatch = batchRepository.findById(product.getBatch().getId()).orElse(null);

        Double unitSize = product.getUnitSize();
        if(product.getUnitType() == ProductUnitType.ML){
            unitSize = product.getUnitSize()/1000;
        }
        Product prevProduct = productRepository.findById(product.getId()).get();
        if (!Objects.equals(prevProduct.getQuantity(), product.getQuantity())){
            if(seletedBatch.getAvailableQuantity() < ( unitSize*product.getQuantity())){
                return ResponseEntity.badRequest().body("Can't Make "+product.getQuantity()+" Items. Batch quantity is insufficient.");
            }else {
                seletedBatch.setAvailableQuantity(seletedBatch.getAvailableQuantity()-( unitSize*product.getQuantity()));
                batchRepository.save(seletedBatch);
            }
        }


//        if (!file.isEmpty()) {
//            try {
//                File uploadDirFile = new File(uploadDir);
//                if (!uploadDirFile.exists()) {
//                    uploadDirFile.mkdirs();
//                }
//
//                String originalFilename = file.getOriginalFilename();
//                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
//                Path filePath = Paths.get(uploadDir, uniqueFilename);
//
//                Files.write(filePath, file.getBytes());
//                photoPath = "/productimages/"+uniqueFilename;
//
//            } catch (IOException e) {
//                e.printStackTrace();
//                return ResponseEntity.status(500).body("response");
//            }
//        }

        product.setBatch(seletedBatch);

        try {
            product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
        } catch (NoSuchAlgorithmException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating unique product code.");
        }

        product.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
        product.setAddedDate(LocalDateTime.now());

        productRepository.save(product);

        return ResponseEntity.ok("Product Updated Successfully");

    }

    @Override
    public ResponseEntity<?> GetAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }
}
