package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.ProductBatchId;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductHasBatchRepository extends JpaRepository<ProductHasBatch, ProductBatchId> {

    @Query(value = "SELECT * FROM product_has_batch WHERE product_id = :productId ORDER BY id ASC LIMIT 1", nativeQuery = true)
    Optional<ProductHasBatch> findFirstByProductId(@Param("productId") Integer productId);

    @NotNull Optional<ProductHasBatch> findById(ProductBatchId id);

    List<ProductHasBatch> findAllByProductId(Integer productId);




}
