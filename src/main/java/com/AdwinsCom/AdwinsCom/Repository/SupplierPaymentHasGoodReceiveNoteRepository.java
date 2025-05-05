package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.SupplierPayment;
import com.AdwinsCom.AdwinsCom.entity.SupplierPaymentHasGoodReceiveNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierPaymentHasGoodReceiveNoteRepository extends JpaRepository<SupplierPayment, Integer> {
//    List<SupplierPaymentHasGoodReceiveNote> findByGoodReceiveNote(GoodReceiveNote goodReceiveNote);

    @Query("SELECT s.goodReceiveNote.grnNo FROM SupplierPaymentHasGoodReceiveNote s WHERE s.supplierPayment.id = :supplierPaymentId")
    List<String> findGrnNumbersBySupplierPaymentId(@Param("supplierPaymentId") Integer supplierPaymentId);
}
