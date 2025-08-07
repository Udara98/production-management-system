package com.AdwinsCom.AdwinsCom.Repository;
import java.util.List;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer>{

    Supplier getSupplierByRegNo(String regNo);


    @Query("SELECT s FROM Supplier s WHERE s.supplierStatus <>'Removed'")
    List<Supplier> findBySupplierStatusNotRemoved();

    @Query("SELECT MAX(s.regNo) FROM Supplier s")
    String getMaxRegNo();

    @Query("SELECT s FROM Supplier s JOIN s.ingredients i WHERE i.ingredientCode = :ingredientCode")
    List<Supplier> findSuppliersByIngredientCode(@Param("ingredientCode") String ingredientCode);

    @Query("SELECT s FROM Supplier s JOIN s.ingredients i WHERE i.id = :ingredientId")
    List<Supplier> findSuppliersByIngredientId(@Param("ingredientId") Integer ingredientId);

    @Query("SELECT s.regNo FROM Supplier s JOIN s.ingredients i WHERE s.supplierStatus = 'Active' AND i.id = :ingredientId")
    List<String> findActiveSuppliersByIngredientId(@Param("ingredientId") Integer ingredientId);





    Boolean existsByRegNo(String regNo);
    Boolean existsByContactNo(String contactNo);
    Boolean existsByEmail(String email);
    Boolean existsByBrn(String brn);
    Boolean existsByCompanyName(String companyName);

}
