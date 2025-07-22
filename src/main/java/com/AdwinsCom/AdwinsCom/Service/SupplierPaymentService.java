package com.AdwinsCom.AdwinsCom.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentHasGoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SupplierPaymentService implements ISupplierPaymentService {

    final SupplierPaymentRepository supplierPaymentRepository;
    final PurchaseOrderRepository purchaseOrderRepository;
    final IngredientRepository ingredientRepository;
    final QuotationRepository quotationRepository;
    final QuotationRequestRepository quotationRequestRepository;
    final GoodReceiveNoteRepository goodReceiveNoteRepository;
    final PaymentMethodSupRepository paymentMethodSupRepository;
    final IPrivilegeService privilegeService;


    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository, PurchaseOrderRepository purchaseOrderRepository, IngredientRepository ingredientRepository, QuotationRepository quotationRepository, QuotationRequestRepository quotationRequestRepository, GoodReceiveNoteRepository goodReceiveNoteRepository, PaymentMethodSupRepository paymentMethodSupRepository, IPrivilegeService privilegeService) {
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.ingredientRepository = ingredientRepository;
        this.quotationRepository = quotationRepository;
        this.quotationRequestRepository = quotationRequestRepository;
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
        this.paymentMethodSupRepository = paymentMethodSupRepository;
        this.privilegeService = privilegeService;
    }


    private String getMaxGrnNo (){
       String maxGrnNo = supplierPaymentRepository.getMaxPaymentNo();
       int nextGrnNum = 1;
       if (maxGrnNo != null && maxGrnNo.startsWith("BILL-")){
           nextGrnNum = Integer.parseInt(maxGrnNo.substring(5)) + 1;
       }
       return String.format("SUP-%04d", nextGrnNum);
    }


    @Override
    @Transactional
    public ResponseEntity<?> AddNewSupplierPayment(SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIERPAYMENT");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Supplier Payment Adds not Completed: You don't have permission!");
        }

        // 1. Map DTO to SupplierPayment entity in service layer (no mapDTO)
        SupplierPayment newSupplierPayment = new SupplierPayment();
        
        newSupplierPayment.setBillNo(getMaxGrnNo());
        newSupplierPayment.setTotalAmount(supplierPaymentDTO.getTotalAmount());
        newSupplierPayment.setAddedUser(userName);
        newSupplierPayment.setAddedDate(java.time.LocalDateTime.now());
        newSupplierPayment.setPaymentDate(supplierPaymentDTO.getPaymentDate());
        newSupplierPayment.setTotalPaymentAmount(supplierPaymentDTO.getTotalPaymentAmount());
        newSupplierPayment.setTotalBalanceAmount(supplierPaymentDTO.getTotalBalanceAmount());
        newSupplierPayment.setPaymentMethod(supplierPaymentDTO.getPaymentMethod());
        // Set supplier
        Supplier supplier = new Supplier();
        supplier.setId(supplierPaymentDTO.getSupplierId());
        newSupplierPayment.setSupplier(supplier);
        // Set Payment MethodSup
        PaymentMethodSup paymentMethodSup = new PaymentMethodSup();
        paymentMethodSup.setTransactionId(supplierPaymentDTO.getTransactionId());
        paymentMethodSup.setPaymentMethod(supplierPaymentDTO.getPaymentMethod());
        newSupplierPayment.setPaymentMethodSup(paymentMethodSup);
        // Save to generate ID
        newSupplierPayment = supplierPaymentRepository.save(newSupplierPayment);
        // Handle SupplierPaymentHasGoodReceiveNote mapping
        List<SupplierPaymentHasGoodReceiveNote> paymentDetails = new ArrayList<>();
        if (supplierPaymentDTO.getPaymentDetails() != null) {
            for (SupplierPaymentHasGoodReceiveNoteDTO detailDTO : supplierPaymentDTO.getPaymentDetails()) {
                SupplierPaymentHasGoodReceiveNote detail = new SupplierPaymentHasGoodReceiveNote();
                detail.setSupplierPayment(newSupplierPayment);
                // Set Good Receive Note
                GoodReceiveNote grn = goodReceiveNoteRepository.findById(detailDTO.getGoodReceiveNoteId())
                        .orElseThrow(() -> new RuntimeException("GRN not found: " + detailDTO.getGoodReceiveNoteId()));
                detail.setGoodReceiveNote(grn);
                // Initialize composite key
                SupplierPaymentGoodReceiveNoteId id = new SupplierPaymentGoodReceiveNoteId();
                id.setSupplierPaymentId(newSupplierPayment.getId());
                id.setGoodReceiveNoteId(grn.getId());
                detail.setId(id);
                detail.setAmount(detailDTO.getAmount());
                detail.setBalance(detailDTO.getBalance());
                paymentDetails.add(detail);
            }
        }
        newSupplierPayment.setPayments(paymentDetails);
        supplierPaymentRepository.save(newSupplierPayment);

        Set<PurchaseOrder> affectedPurchaseOrders = new HashSet<>();

        // 2. Process each GRN payment
        for (SupplierPaymentHasGoodReceiveNoteDTO paymentDetail : supplierPaymentDTO.getPaymentDetails()) {
            GoodReceiveNote grn = goodReceiveNoteRepository.findById(paymentDetail.getGoodReceiveNoteId())
                    .orElseThrow(() -> new RuntimeException("GRN not found: " + paymentDetail.getGoodReceiveNoteId()));

            // Set the new balance (from paymentDetail)
            grn.setBalance(paymentDetail.getBalance());

            // Determine payment status GRNS and purchase order status based on balance
            if (paymentDetail.getBalance() <= 0) {
                grn.setPaymentStatus(GoodReceiveNote.PaymentStatus.Paid);
                grn.setGrnStatus(GoodReceiveNote.GRNStatus.Closed); // Close if fully paid
                PurchaseOrder po = purchaseOrderRepository.findByPurchaseOrderNo(grn.getPurchaseOrder().getPurchaseOrderNo());
                po.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
            } else if (paymentDetail.getAmount() > 0) {
                grn.setPaymentStatus(GoodReceiveNote.PaymentStatus.Partially_Paid);
            } else {
                grn.setPaymentStatus(GoodReceiveNote.PaymentStatus.Pending);
            }

            goodReceiveNoteRepository.save(grn);

            // Track affected Purchase Orders
            if (grn.getPurchaseOrder() != null) {
                affectedPurchaseOrders.add(grn.getPurchaseOrder());
            }
        }

        // Get list of unique Purchase Order Numbers from Good Receive Notes
        List<String> poNos = supplierPaymentDTO.getPaymentDetails().stream()
                .map(detail -> goodReceiveNoteRepository.findById(detail.getGoodReceiveNoteId()).orElse(null))
                .filter(Objects::nonNull)
                .map(grn -> grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getPurchaseOrderNo() : null)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // Retrieve all related Purchase Orders
        List<PurchaseOrder> purchaseOrders = poNos.stream()
                .map(purchaseOrderRepository::findByPurchaseOrderNo)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Process each Purchase Order
        for (PurchaseOrder purchaseOrder : purchaseOrders) {
            Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(purchaseOrder.getIngredientCode());

            // Find and close relevant Quotation Requests
            List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(ingredient.getId());
            QuotationRequest quotationRequest = quotationRequests.stream()
                    .filter(qReq -> qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send)
                    .findFirst()
                    .orElse(null);

            if (quotationRequest != null) {
                // Close relevant quotations
                List<Quotation> quotations = quotationRepository.findByQuotationRequestNo(quotationRequest.getRequestNo());
                for (Quotation quotation : quotations) {
                    if (quotation.getQuotationStatus() != Quotation.QuotationStatus.Accepted) {
                        quotation.setQuotationStatus(Quotation.QuotationStatus.Rejected);
                        quotationRepository.save(quotation);
                    } else {
                        quotation.setQuotationStatus(Quotation.QuotationStatus.Closed);
                        quotationRepository.save(quotation);
                    }
                }
            }


            // Update Ingredient Quantity & Average Cost
            Double currentAvgCost = ingredient.getAvgCost();
            Double currentQuantity = ingredient.getQuantity();
            Double pricePerUnit = purchaseOrder.getPricePerUnit();
            Integer newQuantity = purchaseOrder.getQty();

            Double newAvgCost = (currentAvgCost == null)
                    ? pricePerUnit
                    : ((currentAvgCost * currentQuantity) + (pricePerUnit * newQuantity)) / (currentQuantity + newQuantity);

            ingredient.setAvgCost(newAvgCost);
            ingredientRepository.save(ingredient);

            return ResponseEntity.ok("Supplier Payment Made Successfully");
        }
        return ResponseEntity.ok("Supplier Payment Made Successfully");
    }


    @Override
    public ResponseEntity<?> GetAllSupplierPayment() {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "SUPPLIERPAYMENT");

        if (!loguserPrivi.get("select")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Supplier Payment GetAll not Completed: You don't have permission!");
        }

        List<SupplierPayment> supplierPayments = supplierPaymentRepository.findAll();
        return ResponseEntity.ok(supplierPayments);
    }


    @Override
    public ResponseEntity<?> DeleteSupplierPayment(Integer id) {
        return null;
    }

    @Override
    public ResponseEntity<?> CreateOrFetchPaymentMethod(SupplierPaymentDTO request) {
        if (request.getPaymentMethod() == PaymentMethod.CASH) {
            PaymentMethodSup paymentMethodSup = new PaymentMethodSup(PaymentMethod.CASH, null);
            PaymentMethodSup savedMethod = paymentMethodSupRepository.save(paymentMethodSup);
            return ResponseEntity.ok(savedMethod);
        }
        return ResponseEntity.badRequest().body("Unsupported payment method");
    }

}
