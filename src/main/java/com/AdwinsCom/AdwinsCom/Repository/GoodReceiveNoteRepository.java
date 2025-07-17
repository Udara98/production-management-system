package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoodReceiveNoteRepository extends JpaRepository<GoodReceiveNote, Integer> {
    GoodReceiveNote findByPurchaseOrder(PurchaseOrder pOrder);

    java.util.List<GoodReceiveNote> findAllByPurchaseOrder(PurchaseOrder purchaseOrder);

    GoodReceiveNote findByGrnNo(String grnNo);
    @Query("SELECT gr FROM GoodReceiveNote gr WHERE gr.grnStatus <> 'Removed' ")
    List<GoodReceiveNote> findByGrnStatusNotRemoved();

    List<GoodReceiveNote> findBySupplierId(Integer supplierId);

    @Query("SELECT g.id FROM GoodReceiveNote g WHERE g.grnNo =?1")
    Integer getGRNIdByGRNNo(String grnNo);

    @Query("SELECT g FROM GoodReceiveNote g WHERE g.id = ?1 AND g.grnStatus = 'Approved' AND g.paymentStatus <> 'Paid'")
    List<GoodReceiveNote> getActiveGRNById(Integer grnId);

    @Query("SELECT g FROM GoodReceiveNote g WHERE g.supplier.id = ?1 AND g.grnStatus = 'Approved' AND g.paymentStatus <> 'Paid'")
    List<GoodReceiveNote> getActiveGRNBySupId(Integer supplierId);


    @Query("SELECT SUM(g.acceptedQuantity) FROM GoodReceiveNote g WHERE g.purchaseOrder = ?1 AND g.grnStatus <> 'Removed'")
    Integer sumAcceptedQuantityByPurchaseOrder(PurchaseOrder purchaseOrder);
    @Query(value = "SELECT i.name AS ingredientName,i.ingredient_code AS ingredientCode, SUM(gr.accepted_quantity) AS totalQuantity, SUM(gr.total_amount) AS totalCost, i.rop AS generatedRop, i.ingredient_code AS ingredientCode " +
        "FROM good_receive_note gr " +
        "JOIN purchaseorder po ON gr.purchase_order_id = po.id " +
        "JOIN ingredient i ON po.ingredient_code = i.ingredient_code " +
        "WHERE gr.grn_status = 'Approved' AND gr.received_date BETWEEN ?1 AND ?2 " +
        "GROUP BY i.name, i.ingredient_code", nativeQuery = true)
    List<Object[]> getGrnIngredientSummary(Date sqlStartDate, Date sqlEndDate);

    // Aggregate total accepted quantity per ingredient in the period
    @Query(value = "SELECT i.name AS ingredient,i.ingredient_code AS ingredientCode, SUM(gr.accepted_quantity) AS totalQty " +
        "FROM good_receive_note gr " +
        "JOIN purchaseorder po ON gr.purchase_order_id = po.id " +
        "JOIN ingredient i ON po.ingredient_code = i.ingredient_code " +
        "WHERE gr.grn_status = 'Approved' AND gr.received_date BETWEEN ?1 AND ?2 " +
        "GROUP BY i.name, i.ingredient_code", nativeQuery = true)
    List<Object[]> aggregateIngredientReceivedQty(Date sqlStartDate, Date sqlEndDate);
}
