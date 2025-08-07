package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {
    // Customer sales summary for a period
        // Customer sales summary for a period
        @Query(value = "SELECT c.reg_no AS regNo, " +
        "CASE WHEN c.company_name IS NOT NULL AND c.company_name <> '' THEN c.company_name ELSE CONCAT(c.first_name, ' ', c.second_name) END AS customerName, " +
        "COALESCE(SUM(co.total_amount), 0) AS totalAmount, " +
        "COALESCE(SUM(cop.quantity), 0) AS totalQuantity " +
        "FROM customer_order co " +
        "JOIN customer c ON co.customer_id = c.id " +
        "JOIN customer_order_product cop ON cop.cus_order_id = co.id " +
        "WHERE co.required_date BETWEEN :startDate AND :endDate " +
        "GROUP BY c.reg_no, c.company_name, c.first_name, c.second_name " +
        "ORDER BY totalAmount DESC", nativeQuery = true)
    java.util.List<Object[]> getCustomerSalesSummary(@Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    List<CustomerOrder> findByInvoiceNoStartingWith(String prefix);

    // Define query for getting unpaid orders
    @Query(value = "SELECT co.* FROM customer_order co WHERE co.customer_id = :customerId AND (SELECT COALESCE(SUM(cpho.paid_amount), 0) FROM customer_payment_has_customer_order cpho WHERE cpho.customer_order_id = co.id) < co.total_amount", nativeQuery = true)
    List<CustomerOrder> findUnpaidOrdersByCustomerId(@Param("customerId") Integer customerId);

    @Query(value = "SELECT co.* FROM adwinscom.customer_order co LEFT JOIN ( SELECT cp1.* FROM adwinscom.customer_payment cp1 JOIN ( SELECT order_id, MAX(payment_date) AS latest_payment_date FROM adwinscom.customer_payment GROUP BY order_id ) latest_cp ON cp1.order_id = latest_cp.order_id AND cp1.payment_date = latest_cp.latest_payment_date ) cp ON co.id = cp.order_id WHERE cp.order_id IS NULL OR cp.paidamount < co.total_amount;", nativeQuery = true)
    List<CustomerOrder> gtAllUnpaidCustomerOrders();

    // Sum all unpaid order amounts for a specific customer
    @Query(value = "SELECT COALESCE(SUM(co.total_amount), 0) FROM customer_order co WHERE co.customer_id = :customerId AND (SELECT COALESCE(SUM(cpho.paid_amount), 0) FROM customer_payment_has_customer_order cpho WHERE cpho.customer_order_id = co.id) < co.total_amount", nativeQuery = true)
    Double getTotalOutstandingByCustomerId(@Param("customerId") Integer customerId);

    @Query(value = "SELECT SUM(cpho.balance) FROM adwinscom.customer_payment_has_customer_order AS cpho JOIN adwinscom.customer_order AS co ON co.id = cpho.customer_order_id WHERE co.customer_id = :customerId", nativeQuery = true)
    Double getTotalBalanceByCustomerId(@Param("customerId") Integer customerId);

    // Fetch orders with NotAssigned status for dashboard notifications
    @Query("SELECT co FROM CustomerOrder co WHERE co.orderStatus = :status")
    List<CustomerOrder> findNotAssignedOrders(@Param("status") CustomerOrder.OrderStatus status);

    @Query("SELECT MAX(cusOrder.orderNo) FROM CustomerOrder cusOrder")
    String getMaxRegNo();

    boolean existsByInvoiceNo(String invoiceNo);

    boolean existsByOrderNo(String orderNo);

    // Add existence check for customer orders by customer id
    boolean existsByCustomerId(Integer customerId);
}