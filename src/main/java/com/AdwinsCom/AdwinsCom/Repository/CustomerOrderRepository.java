package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {
    List<CustomerOrder> findByInvoiceNoStartingWith(String prefix);

    // Define query for getting unpaid orders
    @Query(value = "SELECT co.* FROM customer_order co WHERE co.customer_id = :customerId AND (SELECT COALESCE(SUM(cpho.paid_amount), 0) FROM customer_payment_has_customer_order cpho WHERE cpho.customer_order_id = co.id) < co.total_amount", nativeQuery = true)
    List<CustomerOrder> findUnpaidOrdersByCustomerId(@org.springframework.data.repository.query.Param("customerId") Integer customerId);

    @Query(value = "SELECT co.* FROM adwinscom.customer_order co LEFT JOIN ( SELECT cp1.* FROM adwinscom.customer_payment cp1 JOIN ( SELECT order_id, MAX(payment_date) AS latest_payment_date FROM adwinscom.customer_payment GROUP BY order_id ) latest_cp ON cp1.order_id = latest_cp.order_id AND cp1.payment_date = latest_cp.latest_payment_date ) cp ON co.id = cp.order_id WHERE cp.order_id IS NULL OR cp.paidamount < cp.total_amount;", nativeQuery = true)
    List<CustomerOrder> gtAllUnpaidCustomerOrders();

    // Sum all unpaid order amounts for a specific customer
    @Query(value = "SELECT COALESCE(SUM(co.total_amount), 0) FROM customer_order co WHERE co.customer_id = :customerId AND (SELECT COALESCE(SUM(cpho.paid_amount), 0) FROM customer_payment_has_customer_order cpho WHERE cpho.customer_order_id = co.id) < co.total_amount", nativeQuery = true)
    Double getTotalOutstandingByCustomerId(@org.springframework.data.repository.query.Param("customerId") Integer customerId);

}