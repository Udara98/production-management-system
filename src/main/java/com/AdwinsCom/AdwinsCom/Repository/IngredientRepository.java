package com.AdwinsCom.AdwinsCom.Repository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface IngredientRepository extends JpaRepository<Ingredient,Integer> {

    @Query("SELECT i FROM Ingredient i WHERE i.ingredientStatus <> 'Removed'")
    List<Ingredient> findAllByStatusNotRemoved();

    Ingredient getIngredientByIngredientCode(String ingredientCode);

    Ingredient findByIngredientName(String ingredientName);

    @Query("SELECT MAX(i.ingredientCode) FROM Ingredient i")
    String getMaxIngredientCode();

    Boolean existsByIngredientName(String ingredientName);

    Ingredient findByIngredientCode(String ingredientCode);

}
