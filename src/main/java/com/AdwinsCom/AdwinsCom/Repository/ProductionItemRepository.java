package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionItemRepository extends JpaRepository<ProductionItem, Integer> {

    ProductionItem findByProductionItemNo(String pno);

    List<ProductionItem> findByFlavourId(String fid);
    List<ProductionItem> findByPackageTypeId(String pid);

    List<ProductionItem> findByRecipeCode(String rCode);
    @Query("SELECT pi FROM ProductionItem pi WHERE pi.status <> 'Removed' ")
    List<ProductionItem> findByStatusNotRemoved();

}
