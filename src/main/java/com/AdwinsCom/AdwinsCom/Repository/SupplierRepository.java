package com.AdwinsCom.AdwinsCom.Repository;

import java.util.List;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierWithIngredientsDTO;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer>{

    Supplier getSupplierByRegNo(String regNo);


    @Query("SELECT s FROM Supplier s WHERE s.supplierStatus <>'Removed'")
    List<Supplier> findBySupplierStatusNotRemoved();

}
