package com.AdwinsCom.AdwinsCom.entity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    public enum ProductStatus{
        InStock,
        LowStock,
        OutOfStock,
        Removed
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_code", unique = true)
    @NotNull
    private String productCode;

    @Column(name = "product_name",unique = true)
    @NotNull
    private String productName;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ProductHasBatch> batches = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<CustomerOrderProduct> customerOrderProducts = new ArrayList<>();

    @Column(name = "reorder_point")
    @NotNull
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    @NotNull
    private Integer reorderQuantity;

    @Column(name = "quantity")
    @NotNull
    private Integer quantity;

    @Column(name = "note")
    private String note;

    @Column(name = "sale_price")
    @NotNull
    private Double salePrice;

    @Column(name = "unit_type")
    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductUnitType unitType;

    @Column(name = "unit_size")
    @NotNull
    private Double unitSize;

    @Column(name = "product_photo")
    private byte[] ProductPhoto;

    @Column(name = "product_photo_name")
    private String productPhotoName;

    @Column(name = "product_status")
    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductStatus productStatus;

    @Column(name = "addeduser")
    @NotNull
    private Integer addedUser;

    @Column(name = "addeddate")
    @NotNull
    private LocalDateTime addedDate;

    @Column(name = "lastmodifieduser")
    private Integer lastmodifieduser;

    @Column(name = "Lastmodifieddatetime")
    private LocalDateTime Lastmodifieddatetime;

    @Column(name = "deleteduser")
    private Integer deletedUser;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;



    public enum ProductUnitType {
    ML,
    L,
    KG,
    G
}
}

