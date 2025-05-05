package com.AdwinsCom.AdwinsCom.entity.Production;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipe_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ingredient_code")
    @NotNull
    private String ingredientCode;

    @Column(name = "ingredient_name")
    @NotNull
    private String ingredientName;

    @Column(name = "qty")
    private Double qty;

    @Column(name = "unit_type")
    @Enumerated(EnumType.STRING)
    private ProductUnitType unitType;




}
