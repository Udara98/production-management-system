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

    @Query("SELECT MAX(po.purchaseOrderNo) FROM PurchaseOrder po")
    String findMaxPurchaseOrderNo();

    @Query(value = "SELECT po.* FROM purchaseorder po LEFT JOIN (SELECT grn.purchase_order_id, SUM(grn.accepted_quantity) AS total_grn_qty FROM good_receive_note grn  GROUP BY grn.purchase_order_id) grn_sum ON po.id = grn_sum.purchase_order_id WHERE po.qty > IFNULL(grn_sum.total_grn_qty, 0) AND po.qty > 0 AND po.purchase_order_status = 'Pending'", nativeQuery = true)
    List<PurchaseOrder> findPendingPurchaseOrdersForGrn();

}
