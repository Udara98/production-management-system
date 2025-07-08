package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.GoodReceiveNoteRepository;
import com.AdwinsCom.AdwinsCom.Repository.IngredientRepository;
import com.AdwinsCom.AdwinsCom.Repository.PurchaseOrderRepository;
import com.AdwinsCom.AdwinsCom.Repository.SupplierRepository;
import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.PurchaseOrder;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;

@Service
public class GoodReceiveNoteService implements IGoodReceiveNoteService{

    /**
     * Returns the remaining ordered quantity for a given Purchase Order No
     * Remaining = PO.qty - SUM(acceptedQuantity) from all GRNs for that PO
     * Returns null if PO not found. Returns PO.qty if no GRNs yet.
     */
    public Integer getRemainingQuantityForPurchaseOrder(String purchaseOrderNo) {
        PurchaseOrder po = purchaseOrderRepository.findByPurchaseOrderNo(purchaseOrderNo);
        if (po == null) return null;
        Integer orderedQty = po.getQty();
        List<GoodReceiveNote> grns = goodReceiveNoteRepository.findAllByPurchaseOrder(po);
        int acceptedSum = grns.stream()
                .filter(g -> !"Rejected".equalsIgnoreCase(String.valueOf(g.getGrnStatus())))
                .mapToInt(GoodReceiveNote::getAcceptedQuantity)
                .sum();
        return orderedQty - acceptedSum;
    }


    final GoodReceiveNoteRepository goodReceiveNoteRepository;

    final PurchaseOrderRepository purchaseOrderRepository;

    final SupplierRepository supplierRepository;

    final IngredientRepository ingredientRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public GoodReceiveNoteService(GoodReceiveNoteRepository goodReceiveNoteRepository, PurchaseOrderRepository purchaseOrderRepository, IngredientRepository ingredientRepository, SupplierRepository supplierRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.ingredientRepository = ingredientRepository;
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public ResponseEntity<?> AddNewGRN(GoodReceiveNoteDTO goodReceiveNoteDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("GRN Adds not Completed: You don't have permission!");
        }


        // GoodReceiveNote exGoodReceiveNote = goodReceiveNoteRepository.findByPurchaseOrder(goodReceiveNoteDTO.getPurchaseOrder());
        // if(exGoodReceiveNote!=null){
        //     return ResponseEntity.badRequest().body("There is a GRN Available for this Purchase Order.");
        // }

        // Fetch the PurchaseOrder entity to get the supplierRegNo
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(goodReceiveNoteDTO.getPurchaseOrder().getId())
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        // Convert String to Integer
        String supplierRegNoStr = purchaseOrder.getSupplierRegNo();

        // Fetch the Supplier using the supplierRegNo from the PurchaseOrder
        Supplier supplier = supplierRepository.getSupplierByRegNo(supplierRegNoStr);

        // Set the supplier in the GoodReceiveNoteDTO
        goodReceiveNoteDTO.setSupplierId(supplier.getId());

        // Update ingredient quantity (based on accepted quantity)
        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(purchaseOrder.getIngredientCode());
        Double currentQuantity = ingredient.getQuantity();
        Integer acceptedQty = goodReceiveNoteDTO.getAcceptedQuantity() != null ? goodReceiveNoteDTO.getAcceptedQuantity() : 0;
        ingredient.setQuantity(currentQuantity + acceptedQty);
        ingredientRepository.save(ingredient);

        GoodReceiveNote newGoodReceiveNote = new GoodReceiveNote().mapDTO(null, goodReceiveNoteDTO, auth.getName());
        newGoodReceiveNote.setAcceptedQuantity(goodReceiveNoteDTO.getAcceptedQuantity());
        newGoodReceiveNote.setRejectedQuantity(goodReceiveNoteDTO.getRejectedQuantity());
        newGoodReceiveNote.setRejectReason(goodReceiveNoteDTO.getRejectReason());
        newGoodReceiveNote.setPaymentStatus(GoodReceiveNote.PaymentStatus.Pending);
        goodReceiveNoteRepository.save(newGoodReceiveNote);

        // --- Auto-complete PO if fully received ---
        Integer remainingQty = getRemainingQuantityForPurchaseOrder(purchaseOrder.getPurchaseOrderNo());
        if (remainingQty != null && remainingQty <= 0) {
            purchaseOrder.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
            purchaseOrderRepository.save(purchaseOrder);
        }
        // --- End auto-complete logic ---

        return ResponseEntity.ok("GRN Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateGRN(GoodReceiveNoteDTO goodReceiveNoteDTO) throws NoSuchAlgorithmException {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
        if (!loguserPrivi.getOrDefault("update", false)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body("GRN Update not Completed: You don't have permission!");
        }
        // Only allow status to be changed
        GoodReceiveNote grn = goodReceiveNoteRepository.findById(goodReceiveNoteDTO.getId())
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        // Only allow status to be changed
        grn.setGrnStatus(goodReceiveNoteDTO.getGrnStatus());
        goodReceiveNoteRepository.save(grn);

        // Recalculate PO status and remaining quantity
        PurchaseOrder po = grn.getPurchaseOrder();
        java.util.List<GoodReceiveNote> grnsForPO = goodReceiveNoteRepository.findAllByPurchaseOrder(po);
        int totalAccepted = grnsForPO.stream()
                .filter(g -> !"Rejected".equalsIgnoreCase(String.valueOf(g.getGrnStatus())))
                .mapToInt(GoodReceiveNote::getAcceptedQuantity)
                .sum();
        int remaining = po.getQty() - totalAccepted;
        if (remaining > 0) {
            if (po.getProposedDeliveryDate() != null && java.time.LocalDate.now().isAfter(po.getProposedDeliveryDate())) {
                po.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Overdue);
            } else {
                po.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Pending);
            }
        } else {
            po.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
        }
        purchaseOrderRepository.save(po);
        return ResponseEntity.ok("GRN status updated successfully");
    }

    @Override
    public ResponseEntity<?> GetAllGRNs() {
        List<GoodReceiveNote> goodReceiveNotes = goodReceiveNoteRepository.findByGrnStatusNotRemoved();
        return ResponseEntity.ok(goodReceiveNotes);
    }

    @Override
    public ResponseEntity<?> DeleteGRN(Integer id) {
       GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findById(id).get();

       if(goodReceiveNote.getGrnStatus() == GoodReceiveNote.GRNStatus.Pending){
           return ResponseEntity.badRequest().body("Can't Delete Pending GRN");
       }
       goodReceiveNote.setGrnStatus(GoodReceiveNote.GRNStatus.Removed);
       goodReceiveNoteRepository.save(goodReceiveNote);

       return ResponseEntity.ok("GRN Deleted Successfully");
    }

    @Override
    public ResponseEntity<?> getGRNsBySupplierId(Integer supplierId) {
        List<GoodReceiveNote> goodReceiveNotes = goodReceiveNoteRepository.findBySupplierId(supplierId);

        if (goodReceiveNotes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No GRNs found for the given supplier ID.");
        }

        return ResponseEntity.ok(goodReceiveNotes);
    }

    @Override
    public ResponseEntity<?>  getGRNIdByGRNNo(String grnNo) {
        Integer grnId = goodReceiveNoteRepository.getGRNIdByGRNNo(grnNo);
        if (grnId != null) {
            return ResponseEntity.ok(grnId); // 200 OK with the GRNId
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found if no GRNId is found
        }
    }

    @Override
    public ResponseEntity<?> getActiveGRNBySupId(Integer supplierId) {
        List<GoodReceiveNote> grnList = goodReceiveNoteRepository.getActiveGRNBySupId(supplierId);

        if (grnList.isEmpty()) {
            return ResponseEntity.status(404).body("No active Good Receive Notes found for the given SupId.");
        }
        return ResponseEntity.ok(grnList);
    }

}

