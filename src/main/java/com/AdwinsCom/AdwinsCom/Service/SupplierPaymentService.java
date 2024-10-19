package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class SupplierPaymentService implements ISupplierPaymentService {

    final SupplierPaymentRepository supplierPaymentRepository;
    final PurchaseOrderRepository purchaseOrderRepository;
    final IngredientRepository ingredientRepository;
    final QuotationRepository quotationRepository;
    final QuotationRequestRepository quotationRequestRepository;
    final GoodReceiveNoteRepository goodReceiveNoteRepository;

    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository, PurchaseOrderRepository purchaseOrderRepository, IngredientRepository ingredientRepository, QuotationRepository quotationRepository, QuotationRequestRepository quotationRequestRepository, GoodReceiveNoteRepository goodReceiveNoteRepository) {
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.ingredientRepository = ingredientRepository;
        this.quotationRepository = quotationRepository;
        this.quotationRequestRepository = quotationRequestRepository;
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
    }

    @Override
    @Transactional
    public ResponseEntity<?> AddNewSupplierPayment(SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException {

        SupplierPayment exSupplierPayment = supplierPaymentRepository.findByGoodReceiveNote(supplierPaymentDTO.getGoodReceiveNote());
        if (exSupplierPayment != null) {
            return ResponseEntity.badRequest().body("Payment Made Already.");
        }

        SupplierPayment newSupplierPayment = new SupplierPayment().mapDTO(null, supplierPaymentDTO, userName);
        supplierPaymentRepository.save(newSupplierPayment);

        String poNo = supplierPaymentDTO.getGoodReceiveNote().getPurchaseOrder().getPurchaseOrderNo();
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findByPurchaseOrderNo(poNo);
        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(purchaseOrder.getIngredientCode());
        GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findByGrnNo(supplierPaymentDTO.getGoodReceiveNote().getGrnNo());
        List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(ingredient.getId());
        QuotationRequest quotationRequest = new QuotationRequest();
        for (QuotationRequest qReq: quotationRequests
             ) {
            if(qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send){
                quotationRequest = qReq;
            }
        }

        //close quotations

        List<Quotation> quotations = quotationRepository.findByQuotationRequestNo(quotationRequest.getRequestNo());
        for (Quotation quotation: quotations
             ) {
            if(quotation.getQuotationStatus()!=Quotation.QuotationStatus.Accepted){
                quotationRepository.deleteById(quotation.getId());
            }else {
                quotation.setQuotationStatus(Quotation.QuotationStatus.Closed);
                quotationRepository.save(quotation);
            }
        }

        //close grn
        goodReceiveNote.setGrnStatus(GoodReceiveNote.GRNStatus.Closed);
        goodReceiveNoteRepository.save(goodReceiveNote);

        //complete purchase order

        purchaseOrder.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
        purchaseOrderRepository.save(purchaseOrder);

        //Update quantity and avg cost

        Double currentAvgCost = ingredient.getAvgCost();
        Double currentQuantity = ingredient.getQuantity();

        Double pricePerUnit = purchaseOrder.getPricePerUnit();
        Integer newQuantity = purchaseOrder.getQty();

        Double newAvgCost;
        if (currentQuantity == 0) {
            newAvgCost = pricePerUnit;
        } else {
            newAvgCost = ((currentAvgCost * currentQuantity) + (pricePerUnit * newQuantity)) / (currentQuantity + newQuantity);
        }

        ingredient.setAvgCost(newAvgCost);
        ingredient.setQuantity(currentQuantity + newQuantity);

        ingredientRepository.save(ingredient);


        return ResponseEntity.ok("Supplier Payment Made Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllSupplierPayment() {
        List<SupplierPayment> supplierPayments = supplierPaymentRepository.findAll();
        return ResponseEntity.ok(supplierPayments);
    }


    @Override
    public ResponseEntity<?> DeleteSupplierPayment(Integer id) {
        return null;
    }
}
