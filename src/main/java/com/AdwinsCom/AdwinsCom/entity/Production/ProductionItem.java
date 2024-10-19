package com.AdwinsCom.AdwinsCom.entity.Production;

import com.AdwinsCom.AdwinsCom.DTO.ProductionItemDTO;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductionItem {

    public enum ProductionItemStatus{
        Active,
        InActive,
        Removed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "production_item_no", unique = true)
    @NotNull
    private String productionItemNo;

    @Column(name = "production_item_name")
    @NotNull
    private String productionItemName;

    @Column(name = "flavour_id")
    @NotNull
    private String flavourId;

    @Column(name = "package_type_id")
    @NotNull
    private String packageTypeId;

    @Column(name = "recipe_Code")
    @NotNull
    private String recipeCode;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ProductionItemStatus status;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public ProductionItem mapDTO(ProductionItem productionItem, ProductionItemDTO productionItemDTO ,String userName) throws NoSuchAlgorithmException {
        ProductionItem newProductionItem = new ProductionItem();
        if(productionItem !=null){
            newProductionItem = productionItem;
            newProductionItem.setUpdatedUser(userName);
            newProductionItem.setUpdatedDate(LocalDateTime.now());

        }else{
            newProductionItem.setProductionItemNo(QuotationRequest.generateUniqueId("PI-"));
            newProductionItem.setAddedUser(userName);
            newProductionItem.setAddedDate(LocalDateTime.now());
        }
        newProductionItem.setProductionItemName(productionItemDTO.getProductionItemName());
        newProductionItem.setFlavourId(productionItemDTO.getFlavourId());
        newProductionItem.setPackageTypeId(productionItemDTO.getPackageTypeId());
        newProductionItem.setRecipeCode(productionItemDTO.getRecipeCode());
        newProductionItem.setStatus(productionItemDTO.getStatus());

        return newProductionItem;
    }


}
