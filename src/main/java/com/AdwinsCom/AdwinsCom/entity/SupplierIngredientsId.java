package com.AdwinsCom.AdwinsCom.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierIngredientsId implements Serializable {
    private Integer supplierId;
    private Integer ingredientId;
}
