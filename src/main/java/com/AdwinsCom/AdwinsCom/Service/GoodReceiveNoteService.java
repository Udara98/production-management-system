package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.DTO.GrnIngredientSummaryDTO;
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


    private String generateNextGrnNo (){

        String maxGrnNo = goodReceiveNoteRepository.findMaxGrnNo();
        int maxNumber = 1;
        if(maxGrnNo != null && maxGrnNo.startsWith("GRN-")){
            maxNumber = Integer.parseInt(maxGrnNo.substring(4)) +1;
        }
        return String.format("GRN-%04d", maxNumber);
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
        // Calculate new avgCost if unit cost is available
        Double oldQty = ingredient.getQuantity() != null ? ingredient.getQuantity() : 0.0;
        Double oldAvgCost = ingredient.getAvgCost() != null ? ingredient.getAvgCost() : 0.0;
        Double newQty = acceptedQty.doubleValue();
        // Assume unit cost is available from purchaseOrder or DTO
        Double newUnitCost = null;
        if (goodReceiveNoteDTO.getTotalAmount() != null && acceptedQty > 0) {
            newUnitCost = goodReceiveNoteDTO.getTotalAmount() / acceptedQty;
        }
        // Only update avgCost if newUnitCost is available
        if (newUnitCost != null) {
            Double totalQty = oldQty + newQty;
            Double newAvgCost = totalQty > 0 ? ((oldQty * oldAvgCost) + (newQty * newUnitCost)) / totalQty : newUnitCost;
            ingredient.setAvgCost(newAvgCost);
        }
        ingredient.setQuantity(currentQuantity + acceptedQty);
        ingredientRepository.save(ingredient);

        // Manually map fields from DTO to entity (no mapDTO)
        GoodReceiveNote newGoodReceiveNote = new GoodReceiveNote();

        newGoodReceiveNote.setGrnNo(generateNextGrnNo());
        newGoodReceiveNote.setAddedUser(auth.getName());
        newGoodReceiveNote.setAddedDate(java.time.LocalDateTime.now());
        newGoodReceiveNote.setPurchaseOrder(purchaseOrder);
        newGoodReceiveNote.setSupplier(supplier);
        newGoodReceiveNote.setAcceptedQuantity(goodReceiveNoteDTO.getAcceptedQuantity());
        newGoodReceiveNote.setRejectedQuantity(goodReceiveNoteDTO.getRejectedQuantity());
        newGoodReceiveNote.setBalance(goodReceiveNoteDTO.getTotalAmount());
        newGoodReceiveNote.setRejectReason(goodReceiveNoteDTO.getRejectReason());
        newGoodReceiveNote.setPaymentStatus(GoodReceiveNote.PaymentStatus.Pending);
        newGoodReceiveNote.setReceivedDate(java.time.LocalDate.now());
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

           // Authentication and authorization
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();

           // Get privileges for the logged-in user
           HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
   
           // If user doesn't have "insert" permission, return 403 Forbidden
           if (!loguserPrivi.get("select")) {
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                       .body("GRN GetAll not Completed: You don't have permission!");
           }

        List<GoodReceiveNote> goodReceiveNotes = goodReceiveNoteRepository.findByGrnStatusNotRemoved();
        return ResponseEntity.ok(goodReceiveNotes);
    }

    @Override
    public ResponseEntity<?> DeleteGRN(Integer id) {

           // Authentication and authorization
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();

           // Get privileges for the logged-in user
           HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
   
           // If user doesn't have "insert" permission, return 403 Forbidden
           if (!loguserPrivi.get("delete")) {
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                       .body("GRN Delete not Completed: You don't have permission!");
           }

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

            // Authentication and authorization
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            // Get privileges for the logged-in user
            HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
    
            // If user doesn't have "insert" permission, return 403 Forbidden
            if (!loguserPrivi.get("select")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("GRN Select not Completed: You don't have permission!");
            }
 
        List<GoodReceiveNote> goodReceiveNotes = goodReceiveNoteRepository.findBySupplierId(supplierId);

        if (goodReceiveNotes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No GRNs found for the given supplier ID.");
        }

        return ResponseEntity.ok(goodReceiveNotes);
    }

    @Override
    public ResponseEntity<?>  getGRNIdByGRNNo(String grnNo) {

            // Authentication and authorization
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            // Get privileges for the logged-in user
            HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
    
            // If user doesn't have "insert" permission, return 403 Forbidden
            if (!loguserPrivi.get("select")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("GRN Select not Completed: You don't have permission!");
            }
        Integer grnId = goodReceiveNoteRepository.getGRNIdByGRNNo(grnNo);
        if (grnId != null) {
            return ResponseEntity.ok(grnId); // 200 OK with the GRNId
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found if no GRNId is found
        }
    }

    @Override
    public ResponseEntity<?> getActiveGRNBySupId(Integer supplierId) {

            // Authentication and authorization
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            // Get privileges for the logged-in user
            HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");
    
            // If user doesn't have "insert" permission, return 403 Forbidden
            if (!loguserPrivi.get("select")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("GRN Select not Completed: You don't have permission!");
            }
        List<GoodReceiveNote> grnList = goodReceiveNoteRepository.getActiveGRNBySupId(supplierId);

        if (grnList.isEmpty()) {
            return ResponseEntity.status(404).body("No active Good Receive Notes found for the given SupId.");
        }
        return ResponseEntity.ok(grnList);
    }
    public List<GrnIngredientSummaryDTO> getGrnIngredientSummary(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.sql.Date sqlStartDate = java.sql.Date.valueOf(startDate);
        java.sql.Date sqlEndDate = java.sql.Date.valueOf(endDate);
        List<Object[]> rows = goodReceiveNoteRepository.getGrnIngredientSummary(sqlStartDate, sqlEndDate);
        List<GrnIngredientSummaryDTO> result = new java.util.ArrayList<>();

        // Calculate lead time as number of days in the range (inclusive)
        long leadTime = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (leadTime <= 0) leadTime = 1;

        // Aggregate total received quantity per ingredient in the period
        java.util.Map<String, Double> ingredientTotalQty = new java.util.HashMap<>();
        List<Object[]> qtyRows = goodReceiveNoteRepository.aggregateIngredientReceivedQty(sqlStartDate, sqlEndDate);
        for (Object[] row : qtyRows) {
            String ingredientName = row[0] != null ? row[0].toString() : null;
            // row[1] is ingredientCode, row[2] is SUM(gr.accepted_quantity)
            Double qty = row[2] != null ? Double.valueOf(row[2].toString()) : 0d;
            if (ingredientName != null) ingredientTotalQty.put(ingredientName, qty);
        }

        for (Object[] row : rows) {
            String ingredientName = row[0] != null ? row[0].toString() : null;
            String ingredientCode = row[1] != null ? row[1].toString() : null;
            Double totalQuantity1 = row[2] != null ? Double.valueOf(row[2].toString()) : 0d;
            Double totalCost = row[3] != null ? Double.valueOf(row[3].toString()) : 0d;
            Double ropFromDb = row[4] != null ? Double.valueOf(row[4].toString()) : 0d;
            GrnIngredientSummaryDTO dto = new GrnIngredientSummaryDTO();
            dto.setIngredientCode(ingredientCode);
            dto.setIngredientName(ingredientName);
            dto.setTotalQuantity(totalQuantity1);
            dto.setTotalCost(totalCost);
            // Calculate generated ROP as before (average daily usage × leadTime)
            Double totalQty = ingredientTotalQty.getOrDefault(ingredientName, 0d);
            double avgDailyUsage = totalQty / leadTime;
            dto.setGeneratedRop(avgDailyUsage * leadTime);
            dto.setGeneratedRoq(avgDailyUsage * (leadTime + 1));
            result.add(dto);
        }
        return result;
    }

}