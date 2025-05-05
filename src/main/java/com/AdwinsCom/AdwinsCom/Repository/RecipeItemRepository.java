package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Production.Recipe;
import com.AdwinsCom.AdwinsCom.entity.Production.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipeItemRepository extends JpaRepository<RecipeItem, Integer> {

    @Query("SELECT CASE WHEN COUNT(ri) > 0 THEN true ELSE false END FROM RecipeItem ri WHERE ri.ingredientCode = :ingredientCode")
    boolean existsByIngredientCode(@Param("ingredientCode") String ingredientCode);
}
