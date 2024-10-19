package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Production.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch,Integer> {
    @Query("SELECT b FROM Batch b WHERE b.batchStatus <> 'Removed' ")
    List<Batch> findByBatchStatusNotRemoved();
}
