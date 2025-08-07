package com.AdwinsCom.AdwinsCom.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "ingredient")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    public enum IngredientStatus {
        InStock,
        LowStock,
        OutOfStock,
        Removed
    }
    public enum UnitType {
        ML, L, KG, G
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ingredient_code", unique = true, length = 10)
    @NotNull
    private String ingredientCode;

    @Column(name = "name",unique = true)
    @NotNull
    private String ingredientName;

    @Column(name = "note")
    private String note;

    @Column(name = "quantity")
    @NotNull
    private Double quantity;

    @Column(name = "unit_size")
    @NotNull
    @Enumerated(EnumType.STRING)
    private UnitType unitType;

    @Column(name = "rop")
    @NotNull
    private Integer rop;

    @Column(name = "roq")
    @NotNull
    private Integer roq;

    @Column(name = "avg_cost")
    private Double avgCost;

    @Column(name = "ingredient_status")
    @NotNull
    @Enumerated(EnumType.STRING)
    private IngredientStatus ingredientStatus;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    @NotNull
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @ManyToMany(mappedBy = "ingredients")
    private Set<Supplier> suppliers;




}
