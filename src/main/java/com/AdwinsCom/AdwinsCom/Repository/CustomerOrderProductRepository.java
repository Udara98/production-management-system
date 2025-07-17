package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerOrderProductRepository extends JpaRepository<CustomerOrderProduct, Integer> {

    @Query("SELECT COUNT(cop) > 0 FROM CustomerOrderProduct cop WHERE cop.product.id = :productId")
    boolean existsByProductId(Integer productId);

    @Query(value = "SELECT p.product_name AS productName, COALESCE(SUM(cop.quantity), 0) AS totalQuantity, COALESCE(SUM(cop.product_line_price), 0) AS totalAmount " +
            "FROM customer_order_product cop " +
            "JOIN product p ON cop.product_id = p.id " +
            "JOIN customer_order co ON cop.cus_order_id = co.id " +
            "WHERE co.required_date BETWEEN :startDate AND :endDate " +
            "GROUP BY p.product_name " +
            "ORDER BY totalAmount DESC", nativeQuery = true)
    java.util.List<Object[]> getProductSalesSummary(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
