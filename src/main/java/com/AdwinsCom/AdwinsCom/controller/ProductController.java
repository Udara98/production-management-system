package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Repository.ProductRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IPrivilegeService;
import com.AdwinsCom.AdwinsCom.Service.IProductService;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductUnitType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import java.util.HashMap;

@RestController
@RequestMapping(value = "/product")
public class ProductController {


    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private UserRepository userRepository;

    final IProductService productService;
    final ProductRepository productRepository;

    public ProductController(IProductService productService, ProductRepository productRepository) {
        this.productService = productService;
        this.productRepository = productRepository;
    }




    @GetMapping()
    public ModelAndView ProductUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        HashMap<String, Boolean> logUserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "product");
        if (!logUserPrivi.get("select")) {
            return null;
        }
        {
            ModelAndView itemTableView = new ModelAndView();
            itemTableView.setViewName("product.html");
            return itemTableView;
        }
    }


    @PostMapping("/addNewProduct")
    public ResponseEntity<?> AddNewProduct(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batchId") int batchId,
            @RequestParam("productName") String productName,
            @RequestParam("reorderPoint") int reorderPoint,
            @RequestParam("reorderQuantity") int reorderQuantity,
            @RequestParam("quantity") int quantity,
            @RequestParam("salePrice") double salePrice,
            @RequestParam("unitType") ProductUnitType unitType,
            @RequestParam("unitSize") double unitSize,
            @RequestParam("note") String note) {

        try {
            Product product = new Product();
            product.setProductName(productName);
            product.setReorderPoint(reorderPoint);
            product.setReorderQuantity(reorderQuantity);
            product.setQuantity(quantity);
            product.setSalePrice(salePrice);
            product.setUnitType(unitType);
            product.setUnitSize(unitSize);
            product.setNote(note);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return productService.AddNewProduct(product,auth.getName(),batchId,file);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/updateProduct")
    public ResponseEntity<?> UpdateProduct(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batchId") int batchId,
            @RequestParam("id") int id,
            @RequestParam("productName") String productName,
            @RequestParam("reorderPoint") int reorderPoint,
            @RequestParam("reorderQuantity") int reorderQuantity,
            @RequestParam("quantity") int quantity,
            @RequestParam("salePrice") double salePrice,
            @RequestParam("unitType") ProductUnitType unitType,
            @RequestParam("unitSize") double unitSize,
            @RequestParam("note") String note) {

        try {
            Product product = productRepository.findById(id).get();
            product.setProductName(productName);
            product.setReorderPoint(reorderPoint);
            product.setReorderQuantity(reorderQuantity);
            product.setQuantity(quantity);
            product.setSalePrice(salePrice);
            product.setUnitType(unitType);
            product.setUnitSize(unitSize);
            product.setNote(note);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return productService.AddNewProduct(product,auth.getName(),batchId,file);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllProducts")
    public ResponseEntity<?> GetAllProducts() {
        try {
            return productService.GetAllProducts();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


}
