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

    // public static final String ProductUnitType = null;

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

    @Column(name = "product_name")
    @NotNull
    private String productName;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ProductHasBatch> batches = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<CustomerOrderProduct> customerOrderProducts = new ArrayList<>();

//    @ManyToOne
//    @JoinColumn(name = "batch_id" ,referencedColumnName = "id")
//    private Batch batch;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity;

    // public Integer getRop() {
    //     return reorderPoint;
    // }

    // public void setRop(Integer rop) {
    //     this.reorderPoint = rop;
    // }

    // public Integer getRoq() {
    //     return reorderQuantity;
    // }

    // public void setRoq(Integer roq) {
    //     this.reorderQuantity = roq;
    // }

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "note")
    private String note;

    @Column(name = "sale_price")
    private Double salePrice;

    @Column(name = "unit_type")
    @Enumerated(EnumType.STRING)
    private ProductUnitType unitType;

    @Column(name = "unit_size")
    private Double unitSize;

    @Column(name = "product_photo")
    private byte[] ProductPhoto;

    @Column(name = "product_photo_name")
    private String productPhotoName;

    @Column(name = "product_status")
    @Enumerated(EnumType.STRING)
    private ProductStatus productStatus;

    @Column(name = "addeduser")
    private Integer addedUser;

    @Column(name = "addeddate")
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

