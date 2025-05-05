package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.IngredientDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

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

    @Column(name = "name")
    @NotNull
    private String ingredientName;

    @Column(name = "note")
    private String note;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "unit_size")
    @NotNull
    @Enumerated(EnumType.STRING)
    private UnitType unitType;

    @Column(name = "rop")
    private Integer rop;

    @Column(name = "roq")
    private Integer roq;

    @Column(name = "avg_cost")
    private Double avgCost;

    @Column(name = "ingredient_status")
    @Enumerated(EnumType.STRING)
    private IngredientStatus ingredientStatus;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @ManyToMany(mappedBy = "ingredients")
    private Set<Supplier> suppliers;



    public Ingredient mapDTO(Ingredient ingredient,IngredientDTO addDTO, String userName) {
        Ingredient newIngredient = new Ingredient();
        if(ingredient != null){
            newIngredient = ingredient;
            newIngredient.setUpdatedUser(userName);
            newIngredient.setUpdatedDate(LocalDateTime.now());
        }else {
            newIngredient.setAddedUser(userName);
            newIngredient.setAddedDate(LocalDateTime.now());
        }
        newIngredient.setIngredientCode(addDTO.getIngredientCode());
        newIngredient.setIngredientName(addDTO.getIngredientName());
        newIngredient.setNote(addDTO.getNote());
        newIngredient.setQuantity(addDTO.getQuantity());
        newIngredient.setUnitType(addDTO.getUnitType());
        newIngredient.setRop(addDTO.getRop());
        newIngredient.setRoq(addDTO.getRoq());
        newIngredient.setAvgCost(addDTO.getAvgCost());

        return newIngredient;
    }
}
