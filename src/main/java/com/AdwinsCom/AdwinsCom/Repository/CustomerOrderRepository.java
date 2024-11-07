package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {

    // Define query for getting unpaid orders
    @Query(value = "SELECT co.* FROM adwinscom.customer_order co JOIN adwinscom.customer_payment cp ON co.id = cp.order_id WHERE cp.paidamount < cp.total_amount", nativeQuery = true)
    List<CustomerOrder> gtAllUnpaidCustomerOrders();

}