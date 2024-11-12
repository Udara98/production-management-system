package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {

    // Define query for getting unpaid orders
    @Query(value = "SELECT co.* FROM adwinscom.customer_order co LEFT JOIN ( SELECT cp1.* FROM adwinscom.customer_payment cp1 JOIN ( SELECT order_id, MAX(payment_date) AS latest_payment_date FROM adwinscom.customer_payment GROUP BY order_id ) latest_cp ON cp1.order_id = latest_cp.order_id AND cp1.payment_date = latest_cp.latest_payment_date ) cp ON co.id = cp.order_id WHERE cp.order_id IS NULL OR cp.paidamount < cp.total_amount;", nativeQuery = true)
    List<CustomerOrder> gtAllUnpaidCustomerOrders();

}