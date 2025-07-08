package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Integer> {

    // Multi-order payment: implement queries using CustomerPaymentHasOrder if needed

    // Find latest receipt number for generating next receipt number
    @Query("SELECT cp FROM CustomerPayment cp WHERE cp.receiptNo IS NOT NULL ORDER BY cp.id DESC LIMIT 1")
    CustomerPayment findTopByOrderByIdDesc();

    //Define query for get unpaid customer payments
    @Query("SELECT cp FROM CustomerPayment cp WHERE cp.payAmount < cp.totalAmount")
     List<CustomerPayment> gtAllUnpaidCustomerPayments();

    //Define query for get customer payment by order id which is latest and completed
    @Query(value = "SELECT * FROM adwinscom.customer_payment WHERE order_id = ?1 AND payment_status = 'Completed' ORDER BY balance ASC, payment_date DESC LIMIT 1", nativeQuery = true)
    Optional<CustomerPayment> getLatestCompletedPaymentByOrderId(Integer orderId);


}
