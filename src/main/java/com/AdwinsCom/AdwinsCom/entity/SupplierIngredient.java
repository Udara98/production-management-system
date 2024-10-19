package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "supplier_ingredients")
@Data
@AllArgsConstructor
@NoArgsConstructor
@IdClass(SupplierIngredientsId.class)
public class SupplierIngredient {

    @Id
    @Column(name = "supplier_id")
    private Integer supplierId;

    @Id
    @Column(name = "ingredient_id")
    private Integer ingredientId;
}
