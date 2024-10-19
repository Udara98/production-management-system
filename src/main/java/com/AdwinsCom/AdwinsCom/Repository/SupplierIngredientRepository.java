package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.SupplierIngredient;
import com.AdwinsCom.AdwinsCom.entity.SupplierIngredientsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierIngredientRepository extends JpaRepository<SupplierIngredient, SupplierIngredientsId> {

    List<SupplierIngredient> findBySupplierId(Integer id);
    List<SupplierIngredient> findByIngredientId(Integer id);

    void deleteByIngredientId(Integer id);


}
