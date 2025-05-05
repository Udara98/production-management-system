package com.AdwinsCom.AdwinsCom.entity.Production;

import com.AdwinsCom.AdwinsCom.DTO.BatchDTO;
import com.AdwinsCom.AdwinsCom.entity.Product;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import com.AdwinsCom.AdwinsCom.entity.SupplierPaymentHasGoodReceiveNote;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batch")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Batch {

    public enum BatchStatus{
        InProduction,
        ProductionDone,
        Removed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "batch_no")
    private String batchNo;

    @Column(name = "recipe_Code")
    private String recipeCode;

    @Column(name = "recipe_name")
    private String recipeName;

    @Column(name = "total_quantity")
    private Double totalQuantity;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL)
    @JsonBackReference
    private List<ProductHasBatch> products = new ArrayList<>();

    @Column(name = "available_quantity")
    private Double availableQuantity;

    @Column(name = "damaged_quantity")
    private Double damagedQuantity;

    @Column(name = "manufacture_date")
    private LocalDateTime manufactureDate;

    @Column(name = "expire_date")
    private LocalDateTime expireDate;

    @Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "total_sale")
    private Double totalSale;

    @Column(name = "batch_status")
    @Enumerated(EnumType.STRING)
    private BatchStatus batchStatus;

    @Column(name = "note")
    private String note;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;


    public Batch mapDTO(Batch batch, BatchDTO batchDTO,String userName) throws NoSuchAlgorithmException {
        Batch newBatch = new Batch();
        if(batch != null){
            newBatch = batch;
            newBatch.setDamagedQuantity(batchDTO.getDamagedQuantity());
            newBatch.setAvailableQuantity(batchDTO.getAvailableQuantity());
            newBatch.setUpdatedUser(userName);
            newBatch.setUpdatedDate(LocalDateTime.now());
        }else {
            newBatch.setBatchNo(QuotationRequest.generateUniqueId("BCH-"));
            newBatch.setDamagedQuantity(0.0);
            newBatch.setTotalSale(0.0);
            newBatch.setAvailableQuantity(batchDTO.getTotalQuantity());
            newBatch.setAddedUser(userName);
            newBatch.setAddedDate(LocalDateTime.now());
        }
        newBatch.setRecipeCode(batchDTO.getRecipeCode());
        newBatch.setRecipeName(batchDTO.getRecipeName());
        newBatch.setTotalQuantity(batchDTO.getTotalQuantity());
        newBatch.setManufactureDate(batchDTO.getManufactureDate());
        newBatch.setExpireDate(batchDTO.getExpireDate());
        newBatch.setTotalCost(batchDTO.getTotalCost());
        newBatch.setBatchStatus(batchDTO.getBatchStatus());
        newBatch.setNote(batchDTO.getNote());

        return newBatch;

    }

}
