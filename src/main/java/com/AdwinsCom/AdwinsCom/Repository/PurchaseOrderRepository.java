package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    PurchaseOrder findByQuotationNo(String qno);

    PurchaseOrder findByPurchaseOrderNo(String pno);
    @Query("SELECT po FROM PurchaseOrder po WHERE po.purchaseOrderStatus <> 'Removed'")
    List<PurchaseOrder> findByPurchaseOrderStatusNotRemoved();

}
