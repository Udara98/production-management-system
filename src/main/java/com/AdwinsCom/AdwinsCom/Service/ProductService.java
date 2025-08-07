package com.AdwinsCom.AdwinsCom.Service;
import java.util.*;

import com.AdwinsCom.AdwinsCom.DTO.ProductBatchDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductRestockRequestDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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




private String generateNextInvoiceNo() {
    String prefix = "PR-";
    List<Product> allProducts = productRepository.findByProductCodeStartingWith(prefix);
    int maxSeq = 0;
    for (Product product : allProducts) {
        String productCode = product.getProductCode();
        if (productCode != null && productCode.startsWith(prefix)) {
            String seqStr = productCode.substring(prefix.length());
            try {
                int seq = Integer.parseInt(seqStr);
                if (seq > maxSeq) maxSeq = seq;
            } catch (NumberFormatException e) {
                // handle exception
            }
        }
    }
    return prefix + String.format("%04d", maxSeq + 1);
}




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

    System.out.println(dto.getProductName().trim());
    if (productRepository.existsByProductName(dto.getProductName().trim())) {
        return ResponseEntity.badRequest().body("Product Name Already Exists!");
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
        return ResponseEntity.badRequest().body("Insufficient Batch Quantity for batch " + batch.getBatchNo());
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

    

    Integer userId = userRepository.getUserByUserName(auth.getName()).getId();
    LocalDateTime now = LocalDateTime.now();
    product.setAddedUser(userId);
    product.setAddedDate(now);

    product.setProductCode(generateNextInvoiceNo());
    

    // Create ProductHasBatch and assign to product
    ProductHasBatch phb = new ProductHasBatch();
    phb.setProduct(product);
    phb.setBatch(batch);
    phb.setQuantity(dto.getQuantity());
    phb.setSalesPrice(dto.getSalesPrice().doubleValue());
    phb.setExpireDate(batch.getExpireDate());
    phb.setManufacturingDate(batch.getManufactureDate());
    phb.setAddedDate(LocalDateTime.now()); // Use current local time as per user context

    List<ProductHasBatch> batchList = new ArrayList<>();
    batchList.add(phb);
    product.setBatches(batchList);

    // Save everything
    productRepository.save(product);

    return ResponseEntity.ok("Product Added Successfully");
}

   @Override
   public ResponseEntity<?> UpdateProduct(ProductBatchDTO dto)  {
       // Authentication and authorization
       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");
       if (!loguserPrivi.get("update")) {
           return ResponseEntity.status(HttpStatus.FORBIDDEN)
                   .body("Product update not Completed: You don't have permission!");
       }

       if (dto.getProductId() == null) {
           return ResponseEntity.badRequest().body("Product ID is required for update.");
       }

       Optional<Product> optionalProduct = productRepository.findById(dto.getProductId());
       if (!optionalProduct.isPresent()) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found.");
       }
       Product product = optionalProduct.get();

       // Only update allowed fields
       if (dto.getReorderPoint() != null) {
           product.setReorderPoint(dto.getReorderPoint());
       }
       if (dto.getReorderQuantity() != null) {
           product.setReorderQuantity(dto.getReorderQuantity());
       }
       if (dto.getNote() != null) {
           product.setNote(dto.getNote());
       }
       if (dto.getProductPhoto() != null && dto.getProductPhoto().length > 0) {
           product.setProductPhoto(dto.getProductPhoto());
       }

       // Set last modified user and timestamp
    Integer userId = userRepository.getUserByUserName(auth.getName()).getId();
    LocalDateTime now = LocalDateTime.now();
    product.setLastmodifieduser(userId);
    product.setLastmodifieddatetime(now);

       productRepository.save(product);
       return ResponseEntity.ok("Product Updated Successfully");
   }

    @Override
public ResponseEntity<?> GetAllProducts() {

    // Authentication and authorization
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    // Get privileges for the logged-in user
    HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

    if (!loguserPrivi.get("select")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Product GetAll not Completed: You don't have permission!");
    }


    List<Product> products = productRepository.findAll();
    List<ProductBatchDTO> productDTOs = new ArrayList<>();
    for (Product product : products) {
        ProductBatchDTO dto = new ProductBatchDTO();
        dto.setProductId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setProductName(product.getProductName());
        dto.setQuantity(product.getQuantity());
        dto.setProductStatus(product.getProductStatus().toString());
        dto.setUnitSize(product.getUnitSize());
        dto.setUnitType(product.getUnitType());
        dto.setReorderPoint(product.getReorderPoint());
        dto.setReorderQuantity(product.getReorderQuantity());
        dto.setNote(product.getNote());
        dto.setProductPhoto(product.getProductPhoto());
        // Find the latest batch (by id or date)
        List<ProductHasBatch> batches = product.getBatches();
        if (batches != null && !batches.isEmpty()) {
            ProductHasBatch latestBatch = batches.stream()
                .max(Comparator.comparing(ProductHasBatch::getId)) // or use getExpireDate or another field
                .orElse(null);
            if (latestBatch != null) {
                dto.setLatestBatch(latestBatch.getBatch());
                dto.setSalesPrice(latestBatch.getSalesPrice());
            }
        }

            
        productDTOs.add(dto);
    }
    return ResponseEntity.ok(productDTOs);
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

        // Set deletedUser and deleteddatetime (soft delete)
        Integer userId = userRepository.getUserByUserName(auth.getName()).getId();
        LocalDateTime now = LocalDateTime.now();
        product.setDeletedUser(userId);
        product.setDeleteddatetime(now);

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

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PRODUCT");

        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Product Restock not Completed: You don't have permission!");
    }

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
                    .body("Insufficient Batch Quantity for batch " + batch.getBatchNo());
        }

        // Deduct the required quantity from the batch
        batch.setAvailableQuantity(batch.getAvailableQuantity() - requiredQty);
        batchRepository.save(batch);


        newProductHasBatch.setProduct(product);
        newProductHasBatch.setBatch(batch);
        newProductHasBatch.setQuantity(request.getQuantity());
        newProductHasBatch.setSalesPrice(request.getSalesPrice());
        newProductHasBatch.setExpireDate(request.getExpireDate());
        newProductHasBatch.setAddedUser(userRepository.getUserByUserName(auth.getName()).getId());
        newProductHasBatch.setAddedDate(LocalDateTime.now());
        newProductHasBatch.setManufacturingDate(batch.getManufactureDate());
        newProductHasBatch.setExpireDate(batch.getExpireDate());


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
