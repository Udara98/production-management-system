package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Integer> {

    Quotation findByQuotationRequestNoAndSupplierRegNo(String reqNo, String supRegNo);

    List<Quotation> findByQuotationRequestNo(String qrNo);
    @Query("SELECT q FROM Quotation q WHERE q.quotationStatus <> 'Removed'")
    List<Quotation> findByQuotationStatusNotRemoved();

}
