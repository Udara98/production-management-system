package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch,Integer> {

    @Query("SELECT b FROM Batch b WHERE b.batchStatus <> 'Removed' ")
    List<Batch> findByBatchStatusNotRemoved();

    // For FIFO (Oldest manufactureDate first)
    List<Batch> findByRecipeCodeOrderByManufactureDateAsc(String recipeCode);

    // For LIFO (Newest manufactureDate first)
    List<Batch> findByRecipeCodeOrderByManufactureDateDesc(String recipeCode);

    @Query("SELECT b.batchNo FROM Batch b WHERE b.id = :batchId")
    String findBatchNoById(@Param("batchId") Integer batchId);

    @Query("SELECT b.batchNo, b.totalQuantity, b.availableQuantity, b.damagedQuantity, b.totalCost FROM Batch b WHERE b.batchStatus <> 'Removed' AND b.manufactureDate BETWEEN :startDate AND :endDate")
    List<Object[]> getBatchProductionReportByDateRange(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT b.batchNo, b.totalQuantity, b.availableQuantity, b.damagedQuantity, b.totalCost FROM Batch b WHERE b.batchStatus <> 'Removed'")
    List<Object[]> getBatchProductionReport();

    @Query("SELECT MAX(b.batchNo) FROM Batch b")
    String findMaxBatchNo();
}

