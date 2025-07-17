package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.entity.Product;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_order_product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderProduct {

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "product_id" ,referencedColumnName = "id")
    private Product product;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "cus_order_id", referencedColumnName = "id")
    private CustomerOrder customerOrder;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "product_price")
    private Double productPrice;

    @Column(name = "product_line_price")
    private Double productLinePrice;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "product_has_batch_id", referencedColumnName = "id")
    private ProductHasBatch productHasBatch;
}
