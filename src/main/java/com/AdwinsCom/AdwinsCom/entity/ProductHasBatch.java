package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_has_batch")
@Data
public class ProductHasBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    @ManyToOne
    @JoinColumn(name = "batch_id")
//    @JsonIgnore
    private Batch batch;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "sales_price")
    private Double salesPrice;

    @Column(name = "expire_date")
    private LocalDateTime expireDate;
}



