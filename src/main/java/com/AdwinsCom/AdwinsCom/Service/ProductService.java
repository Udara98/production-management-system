package com.AdwinsCom.AdwinsCom.Service;
import java.util.Objects;

import com.AdwinsCom.AdwinsCom.Repository.BatchRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductRepository;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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

    @Value("${upload.dir}")
    private String uploadDir;
    final ProductRepository productRepository;
    final BatchRepository batchRepository;
    public ProductService(ProductRepository productRepository, BatchRepository batchRepository) {
        this.productRepository = productRepository;
        this.batchRepository = batchRepository;
    }

    @Override
    @Transactional
    public ResponseEntity<?> AddNewProduct(Product product, String userName, Integer batchId, MultipartFile file) throws NoSuchAlgorithmException {

        String photoPath = "";
        Batch seletedBatch = batchRepository.findById(batchId).get();

        Double unitSize = product.getUnitSize();
        if(product.getUnitType() == ProductUnitType.ML){
            unitSize = product.getUnitSize()/1000;
        }

        if(seletedBatch.getAvailableQuantity() < ( unitSize*product.getQuantity())){
            return ResponseEntity.badRequest().body("Can't Make "+product.getQuantity()+" Items. Batch quantity is insufficient.");
        }else {
            seletedBatch.setAvailableQuantity(seletedBatch.getAvailableQuantity()-( unitSize*product.getQuantity()));
            batchRepository.save(seletedBatch);
        }


        if (!file.isEmpty()) {
            try {
                File uploadDirFile = new File(uploadDir);
                if (!uploadDirFile.exists()) {
                    uploadDirFile.mkdirs();
                }

                String originalFilename = file.getOriginalFilename();
                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                Path filePath = Paths.get(uploadDir, uniqueFilename);

                Files.write(filePath, file.getBytes());
                photoPath = "/productimages/"+uniqueFilename;

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("response");
            }
        }

        product.setBatch(seletedBatch);
        product.setPhotoPath(photoPath);
        product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
        product.setAddedUser(userName);
        product.setAddedDate(LocalDateTime.now());

        productRepository.save(product);

        return ResponseEntity.ok("Product Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateProduct(Product product, String userName, Integer batchId, MultipartFile file) throws NoSuchAlgorithmException {
        String photoPath = "";
        Batch seletedBatch = batchRepository.findById(batchId).get();

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


        if (!file.isEmpty()) {
            try {
                File uploadDirFile = new File(uploadDir);
                if (!uploadDirFile.exists()) {
                    uploadDirFile.mkdirs();
                }

                String originalFilename = file.getOriginalFilename();
                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                Path filePath = Paths.get(uploadDir, uniqueFilename);

                Files.write(filePath, file.getBytes());
                photoPath = "/productimages/"+uniqueFilename;

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("response");
            }
        }

        product.setBatch(seletedBatch);
        product.setPhotoPath(photoPath);
        product.setProductCode(QuotationRequest.generateUniqueId("PR-"));
        product.setAddedUser(userName);
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
