package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoodReceiveNoteRepository extends JpaRepository<GoodReceiveNote, Integer> {
    GoodReceiveNote findByPurchaseOrder(PurchaseOrder pOrder);

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



}
