package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerOrderProductRepository extends JpaRepository<CustomerOrderProduct, Integer> {

    @Query("SELECT COUNT(cop) > 0 FROM CustomerOrderProduct cop WHERE cop.product.id = :productId")
    boolean existsByProductId(Integer productId);
}
