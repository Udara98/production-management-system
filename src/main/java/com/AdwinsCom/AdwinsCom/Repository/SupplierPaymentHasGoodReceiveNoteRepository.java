package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.SupplierPayment;
import com.AdwinsCom.AdwinsCom.entity.SupplierPaymentHasGoodReceiveNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierPaymentHasGoodReceiveNoteRepository extends JpaRepository<SupplierPayment, Integer> {

    @Query(value = "SELECT s.reg_no AS supNo, s.supplier_name AS supplierName, SUM(sph.amount) AS amountPaid, SUM(sph.balance) AS outstandingAmount " +
        "FROM supplier_payment_has_good_receive_note sph " +
        "JOIN good_receive_note grn ON sph.good_receive_note_id = grn.id " +
        "JOIN supplier s ON grn.supplier_id = s.id " +
        "WHERE grn.received_date BETWEEN :startDate AND :endDate " +
        "GROUP BY s.reg_no, s.supplier_name", nativeQuery = true)
    List<Object[]> getSupplierPaymentReportByDateRangeQ(@Param("startDate") String startDate, @Param("endDate") String endDate);

//    List<SupplierPaymentHasGoodReceiveNote> findByGoodReceiveNote(GoodReceiveNote goodReceiveNote);

    @Query("SELECT s.goodReceiveNote.grnNo FROM SupplierPaymentHasGoodReceiveNote s WHERE s.supplierPayment.id = :supplierPaymentId")
    List<String> findGrnNumbersBySupplierPaymentId(@Param("supplierPaymentId") Integer supplierPaymentId);
}
