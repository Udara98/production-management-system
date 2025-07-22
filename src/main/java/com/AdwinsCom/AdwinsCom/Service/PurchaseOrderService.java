package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.PurchaseOrderDTO;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.PurchaseOrderRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRepository;
import com.AdwinsCom.AdwinsCom.Repository.QuotationRequestRepository;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@Service
public class PurchaseOrderService implements IPurchaseOrderService{

    final PurchaseOrderRepository purchaseOrderRepository;
    final QuotationRepository quotationRepository;
    final IngredientRepository ingredientRepository;

    final QuotationRequestRepository quotationRequestRepository;
    final IPrivilegeService privilegeService;
    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository, QuotationRepository quotationRepository, IngredientRepository ingredientRepository, QuotationRequestRepository quotationRequestRepository, IPrivilegeService privilegeService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.quotationRepository = quotationRepository;
        this.ingredientRepository = ingredientRepository;
        this.quotationRequestRepository = quotationRequestRepository;
        this.privilegeService = privilegeService;
    }


    private String nextPoNo() {
        String maxPoNo = purchaseOrderRepository.findMaxPurchaseOrderNo();
        int max = 1;
        if (maxPoNo != null && maxPoNo.startsWith("PO-")) {
            max = Integer.parseInt(maxPoNo.substring(3)) + 1;
        }
        return "PO-" + String.format("%04d", max);
    }

    @Override
    public ResponseEntity<?> AddNewPurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException {

          // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();

         // Get privileges for the logged-in user
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PURCHASE_ORDER");
 
         // If user doesn't have "insert" permission, return 403 Forbidden
         if (!loguserPrivi.get("insert")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Purchase Order Add not Completed: You don't have permission!");
         }
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

       

        // Manually map DTO to entity (no mapDTO)
        PurchaseOrder newPurchaseOrder = new PurchaseOrder();
        newPurchaseOrder.setPurchaseOrderNo(nextPoNo());
        newPurchaseOrder.setQuotationNo(purchaseOrderDTO.getQuotationNo());
        newPurchaseOrder.setIngredientCode(purchaseOrderDTO.getIngredientCode());
        newPurchaseOrder.setSupplierRegNo(purchaseOrderDTO.getSupplierRegNo());
        newPurchaseOrder.setPricePerUnit(purchaseOrderDTO.getPricePerUnit());
        newPurchaseOrder.setAddedUser(userName);
        newPurchaseOrder.setAddedDate(java.time.LocalDateTime.now());
        newPurchaseOrder.setQty(purchaseOrderDTO.getQty());
        newPurchaseOrder.setTotalPrice(purchaseOrderDTO.getTotalPrice());
        newPurchaseOrder.setProposedDeliveryDate(purchaseOrderDTO.getProposedDeliveryDate());
        newPurchaseOrder.setNotes(purchaseOrderDTO.getNotes());
        newPurchaseOrder.setPurchaseOrderStatus(purchaseOrderDTO.getPurchaseOrderStatus());
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

          // Authentication and authorization
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();

          // Get privileges for the logged-in user
          HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PURCHASE_ORDER");
  
          // If user doesn't have "insert" permission, return 403 Forbidden
          if (!loguserPrivi.get("select")) {
              return ResponseEntity.status(HttpStatus.FORBIDDEN)
                      .body("Purchase Order GetAll not Completed: You don't have permission!");
          }

        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByPurchaseOrderStatusNotRemoved();
        return ResponseEntity.ok(purchaseOrders);
    }

    @Override
    public ResponseEntity<?> UpdatePurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException {
           // Authentication and authorization
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();

           // Get privileges for the logged-in user
           HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PURCHASE_ORDER");
   
           // If user doesn't have "insert" permission, return 403 Forbidden
           if (!loguserPrivi.get("update")) {
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                       .body("Purchase Order Update not Completed: You don't have permission!");
           }
        PurchaseOrder exPurchaseOrder = purchaseOrderRepository.findByQuotationNo(purchaseOrderDTO.getQuotationNo());
        if (exPurchaseOrder != null) {
            exPurchaseOrder.setUpdatedUser(userName);
            exPurchaseOrder.setUpdatedDate(java.time.LocalDateTime.now());
            exPurchaseOrder.setQuotationNo(purchaseOrderDTO.getQuotationNo());
            exPurchaseOrder.setIngredientCode(purchaseOrderDTO.getIngredientCode());
            exPurchaseOrder.setSupplierRegNo(purchaseOrderDTO.getSupplierRegNo());
            exPurchaseOrder.setPricePerUnit(purchaseOrderDTO.getPricePerUnit());
            exPurchaseOrder.setQty(purchaseOrderDTO.getQty());
            exPurchaseOrder.setTotalPrice(purchaseOrderDTO.getTotalPrice());
            exPurchaseOrder.setProposedDeliveryDate(purchaseOrderDTO.getProposedDeliveryDate());
            exPurchaseOrder.setNotes(purchaseOrderDTO.getNotes());
            exPurchaseOrder.setPurchaseOrderStatus(purchaseOrderDTO.getPurchaseOrderStatus());
            purchaseOrderRepository.save(exPurchaseOrder);
        }
        return ResponseEntity.ok("Purchase order updated successfully");
    }

    @Override
    public ResponseEntity<?> DeletePurchaseOrder(Integer Id) {

           // Authentication and authorization
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();

           // Get privileges for the logged-in user
           HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "PURCHASE_ORDER");
   
           // If user doesn't have "insert" permission, return 403 Forbidden
           if (!loguserPrivi.get("delete")) {
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                       .body("Purchase Order Delete not Completed: You don't have permission!");
           }

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
