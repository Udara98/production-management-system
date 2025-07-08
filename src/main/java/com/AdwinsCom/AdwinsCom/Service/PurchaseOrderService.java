package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.PurchaseOrderDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.PurchaseOrderRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseOrderService implements IPurchaseOrderService{

    final PurchaseOrderRepository purchaseOrderRepository;
    final QuotationRepository quotationRepository;
    final IngredientRepository ingredientRepository;

    final QuotationRequestRepository quotationRequestRepository;
    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository, QuotationRepository quotationRepository, IngredientRepository ingredientRepository, QuotationRequestRepository quotationRequestRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.quotationRepository = quotationRepository;
        this.ingredientRepository = ingredientRepository;
        this.quotationRequestRepository = quotationRequestRepository;
    }

    @Override
    public ResponseEntity<?> AddNewPurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException {
        // Check for existing purchase order for this quotation
        PurchaseOrder exPurchaseOrder = purchaseOrderRepository.findByQuotationNo(purchaseOrderDTO.getQuotationNo());
        if (exPurchaseOrder != null && exPurchaseOrder.getPurchaseOrderStatus() != PurchaseOrder.PurchaseOrderStatus.Removed) {
            return ResponseEntity.badRequest().body("There is an existing Purchase Order for this Quotation.");
        }

        // Check ingredient existence
        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(purchaseOrderDTO.getIngredientCode());
        if (ingredient == null) {
            return ResponseEntity.badRequest().body("Invalid ingredient code: " + purchaseOrderDTO.getIngredientCode());
        }

        // Save new purchase order
        PurchaseOrder newPurchaseOrder = new PurchaseOrder().mapDTO(null, purchaseOrderDTO, userName);
        newPurchaseOrder.setOrderedDate(LocalDate.now());
        purchaseOrderRepository.save(newPurchaseOrder);

        // Close related quotation request
        List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(ingredient.getId());
        QuotationRequest quotationRequest = null;
        for (QuotationRequest qReq : quotationRequests) {
            if (qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send) {
                quotationRequest = qReq;
                break;
            }
        }
        if (quotationRequest != null) {
            quotationRequest.setRequestStatus(QuotationRequest.QRequestStatus.Closed);
            quotationRequestRepository.save(quotationRequest);
        }

        return ResponseEntity.ok("Purchase order placed successfully");
    }

    @Override
    public ResponseEntity<?> GetAllPurchaseOrders() {
        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByPurchaseOrderStatusNotRemoved();
        return ResponseEntity.ok(purchaseOrders);
    }

    @Override
    public ResponseEntity<?> UpdatePurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException {
        PurchaseOrder exPurchaseOrder = purchaseOrderRepository.findByQuotationNo(purchaseOrderDTO.getQuotationNo());
        PurchaseOrder updatedPurchaseOrder = new PurchaseOrder().mapDTO(exPurchaseOrder,purchaseOrderDTO, userName);
        purchaseOrderRepository.save(updatedPurchaseOrder);
        return ResponseEntity.ok("Purchase order updated successfully");
    }

    @Override
    public ResponseEntity<?> DeletePurchaseOrder(Integer Id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(Id).get();
        if(purchaseOrder.getPurchaseOrderStatus()== PurchaseOrder.PurchaseOrderStatus.Pending){
            return ResponseEntity.badRequest().body("Can't Delete Pending Purchase Orders");
        }else{
            purchaseOrder.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Removed);
        }
        purchaseOrderRepository.save(purchaseOrder);
        return ResponseEntity.ok("Purchase Order Deleted Successfully.");
    }
}
