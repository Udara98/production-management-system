package com.AdwinsCom.AdwinsCom.Service;
import java.util.*;

import com.AdwinsCom.AdwinsCom.DTO.ProductBatchDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductRestockRequestDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.ProductBatchId;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
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

@Service
public class ProductService implements IProductService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductHasBatchRepository productHasBatchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerOrderProductRepository customerOrderProductRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
@Transactional
public ResponseEntity<?> AddNewProduct(ProductBatchDTO dto) {

    // Authentication and authorization
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    // Get privileges for the logged-in user
    HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

    if (!loguserPrivi.get("insert")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Product Add not Completed: You don't have permission!");
    }

    // Validate and fetch the batch
    if (dto.getBatch() == null || dto.getBatch().getId() == null) {
        return ResponseEntity.badRequest().body("A valid batch is required.");
    }

    Batch batch = batchRepository.findById(dto.getBatch().getId()).orElse(null);
    if (batch == null) {
        return ResponseEntity.badRequest().body("Batch with ID " + dto.getBatch().getId() + " does not exist.");
    }

    // Check available quantity
    double unitSize = dto.getUnitSize();
    if (dto.getUnitType() == Product.ProductUnitType.ML) {
        unitSize = unitSize / 1000.0;
    }

    double requiredQty = unitSize * dto.getQuantity();
    if (batch.getAvailableQuantity() < requiredQty) {
        return ResponseEntity.badRequest().body("Insufficient batch quantity for batch ID " + batch.getId());
    }

    // Deduct batch quantity
    batch.setAvailableQuantity(batch.getAvailableQuantity() - requiredQty);
    batchRepository.save(batch);

    // Create product
    Product product = new Product();
    product.setProductName(dto.getProductName());
    product.setQuantity(dto.getQuantity());
    product.setUnitSize(dto.getUnitSize());
    product.setUnitType(dto.getUnitType());
    product.setReorderPoint(dto.getReorderPoint());
    product.setSalePrice(dto.getSalesPrice());
    product.setReorderQuantity(dto.getReorderQuantity());
    product.setNote(dto.getNote());
    product.setProductPhoto(dto.getProductPhoto());
    product.setProductStatus(Product.ProductStatus.InStock);

    try {
        product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
    } catch (NoSuchAlgorithmException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error generating unique product code.");
    }

    product.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
    product.setAddedDate(LocalDateTime.now());

    // Create ProductHasBatch and assign to product
    ProductHasBatch phb = new ProductHasBatch();
    phb.setProduct(product);
    phb.setBatch(batch);
    phb.setQuantity(dto.getQuantity());
    phb.setSalesPrice(dto.getSalesPrice().doubleValue());
    phb.setExpireDate(batch.getExpireDate());

    List<ProductHasBatch> batchList = new ArrayList<>();
    batchList.add(phb);
    product.setBatches(batchList);

    // Save everything
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

//    @Override
//    public ResponseEntity<?> UpdateProduct(Product product)  {
//
//        // Authentication and authorization
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//
//        // Get privileges for the logged-in user
//        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");
//
//        // If user doesn't have "delete" permission, return 403 Forbidden
//        if (!loguserPrivi.get("update")) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body("Product update not Completed: You don't have permission!");
//        }
//
//        String photoPath = "";
//        Batch seletedBatch = batchRepository.findById(product.getBatch().getId()).orElse(null);
//
//        Double unitSize = product.getUnitSize();
//        if(product.getUnitType() == ProductUnitType.ML){
//            unitSize = product.getUnitSize()/1000;
//        }
//        Product prevProduct = productRepository.findById(product.getId()).get();
//        if (!Objects.equals(prevProduct.getQuantity(), product.getQuantity())){
//            if(seletedBatch.getAvailableQuantity() < ( unitSize*product.getQuantity())){
//                return ResponseEntity.badRequest().body("Can't Make "+product.getQuantity()+" Items. Batch quantity is insufficient.");
//            }else {
//                seletedBatch.setAvailableQuantity(seletedBatch.getAvailableQuantity()-( unitSize*product.getQuantity()));
//                batchRepository.save(seletedBatch);
//            }
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
//
//        try {
//            product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
//        } catch (NoSuchAlgorithmException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error generating unique product code.");
//        }
//
//        product.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
//        product.setAddedDate(LocalDateTime.now());
//
//        productRepository.save(product);
//
//        return ResponseEntity.ok("Product Updated Successfully");
//
//    }

    @Override
    public ResponseEntity<?> GetAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteProduct(Integer productId) {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

        // Check delete permission
        if (!loguserPrivi.get("delete")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Product deletion not allowed: You don't have permission!");
        }

        // Find the product
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product not found with ID: " + productId);
        }

        // Check if product has associated transactions (orders, invoices, etc.)
        boolean hasTransactions = customerOrderProductRepository.existsByProductId(productId);
        if (hasTransactions) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Cannot Delete product as it is associated with transactions.");
        }

        // For each batch associated with this product, return the quantity to the batch
        if (product.getBatches() != null) {
            for (ProductHasBatch phb : product.getBatches()) {
                Batch batch = phb.getBatch();
                if (batch != null) {
                    double quantityToReturn = product.getUnitType() == Product.ProductUnitType.ML ?
                            (product.getUnitSize() / 1000) * phb.getQuantity() :
                            product.getUnitSize() * phb.getQuantity();
                    batch.setAvailableQuantity(batch.getAvailableQuantity() + quantityToReturn);
                    batchRepository.save(batch);
                }
            }
        }

        // Soft delete approach (recommended)
        product.setProductStatus(Product.ProductStatus.Removed);
        productRepository.save(product);

        // Alternative: Hard delete (not recommended for ERP systems)
        // productRepository.delete(product);

        return ResponseEntity.ok("Product deleted successfully");
    }

    @Override
    public ResponseEntity<?> restockProduct(ProductRestockRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // Create a new ProductHasBatch entry
        ProductHasBatch newProductHasBatch = new ProductHasBatch();


        // Calculate the required quantity based on unit size and product quantity
        Double unitSize = product.getUnitSize();
        if (product.getUnitType() == Product.ProductUnitType.ML) {
            unitSize = unitSize / 1000;
        }
        Double requiredQty = unitSize * request.getQuantity();

        // Check if the batch has sufficient quantity
        if (batch.getAvailableQuantity() < requiredQty) {
            return ResponseEntity.badRequest()
                    .body("Insufficient batch quantity for batch ID " + batch.getId());
        }

        // Deduct the required quantity from the batch
        batch.setAvailableQuantity(batch.getAvailableQuantity() - requiredQty);
        batchRepository.save(batch);


        newProductHasBatch.setProduct(product);
        newProductHasBatch.setBatch(batch);
        newProductHasBatch.setQuantity(request.getQuantity());
        newProductHasBatch.setSalesPrice(request.getSalesPrice());
        newProductHasBatch.setExpireDate(request.getExpireDate());


        // Save the ProductHasBatch entity to the database
        productHasBatchRepository.save(newProductHasBatch);

        // Update product quantity
        List<ProductHasBatch> productBatches = productHasBatchRepository.findAllByProductId(product.getId());
        double totalQuantity = productBatches.stream().mapToDouble(ProductHasBatch::getQuantity).sum();
        product.setQuantity((int) totalQuantity);
        productRepository.save(product);

        return ResponseEntity.ok("Product restocked successfully.");
    }

}
