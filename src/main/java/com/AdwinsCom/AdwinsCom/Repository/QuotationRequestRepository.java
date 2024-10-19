package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRequestRepository extends JpaRepository<QuotationRequest, Integer> {

    List<QuotationRequest> findByIngredientId(Integer ingId);
    @Query("SELECT qr FROM QuotationRequest qr WHERE qr.requestStatus <> 'Removed' ")
    List<QuotationRequest> findAllByRequestStatusNotRemoved();

    void deleteByIngredientId(Integer ingId);

}
