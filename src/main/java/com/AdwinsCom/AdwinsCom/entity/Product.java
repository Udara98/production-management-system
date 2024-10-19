package com.AdwinsCom.AdwinsCom.entity;
import com.AdwinsCom.AdwinsCom.entity.Production.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;


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

    @ManyToOne
    @JoinColumn(name = "batch_id" ,referencedColumnName = "id")
    private Batch batch;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity;

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

    @Column(name = "photo_path")
    private String photoPath;

    @Column(name = "product_status")
    @Enumerated(EnumType.STRING)
    private ProductStatus productStatus;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
