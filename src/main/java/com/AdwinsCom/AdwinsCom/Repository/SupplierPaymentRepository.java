package com.AdwinsCom.AdwinsCom.Repository;
import com.AdwinsCom.AdwinsCom.entity.SupplierPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment,Integer> {

    @Query("SELECT MAX(sp.billNo) FROM SupplierPayment sp")
    String getMaxPaymentNo();

}
