package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentDTO;
import com.AdwinsCom.AdwinsCom.DTO.SupplierPaymentHasGoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.*;
import com.AdwinsCom.AdwinsCom.entity.*;
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


    public SupplierPaymentService(SupplierPaymentRepository supplierPaymentRepository, PurchaseOrderRepository purchaseOrderRepository, IngredientRepository ingredientRepository, QuotationRepository quotationRepository, QuotationRequestRepository quotationRequestRepository, GoodReceiveNoteRepository goodReceiveNoteRepository, PaymentMethodSupRepository paymentMethodSupRepository) {
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.ingredientRepository = ingredientRepository;
        this.quotationRepository = quotationRepository;
        this.quotationRequestRepository = quotationRequestRepository;
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
        this.paymentMethodSupRepository = paymentMethodSupRepository;
    }

//    @Override
//    @Transactional
//    public ResponseEntity<?> AddNewSupplierPayment(SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException {
//
////        SupplierPayment exSupplierPayment = supplierPaymentRepository.findByGoodReceiveNote(supplierPaymentDTO.getGoodReceiveNote());
////        if (exSupplierPayment != null) {
////            return ResponseEntity.badRequest().body("Payment Made Already.");
////        }
//
//        SupplierPayment newSupplierPayment = new SupplierPayment().mapDTO(null, supplierPaymentDTO, userName);
//        // Set fields from requestDTO
//
//        supplierPaymentRepository.save(newSupplierPayment);
//
//        List<String> poNos = supplierPaymentDTO.getPaymentDetails().stream()
//                .map(detail -> goodReceiveNoteRepository.findById(detail.getGoodReceiveNoteId()).orElse(null))
//                .filter(Objects::nonNull)
//                .map(grn -> grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getPurchaseOrderNo() : null)
//                .filter(Objects::nonNull)
//                .distinct()
//                .collect(Collectors.toList());
//
//
//
//        List<PurchaseOrder> purchaseOrders = supplierPaymentDTO.getPaymentDetails().stream()
//                .map(detail -> goodReceiveNoteRepository.findById(detail.getGoodReceiveNoteId()).orElse(null))
//                .filter(Objects::nonNull)
//                .map(grn -> grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getPurchaseOrderNo() : null)
//                .filter(Objects::nonNull)
//                .distinct()
//                .map(purchaseOrderRepository::findByPurchaseOrderNo)
//                .filter(Objects::nonNull)
//                .collect(Collectors.toList());
//
//        Ingredient ingredient = ingredientRepository.getIngredientByIngredientCode(purchaseOrder.getIngredientCode());
//        GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findByGrnNo(supplierPaymentDTO.getGoodReceiveNote().getGrnNo());
//        List<QuotationRequest> quotationRequests = quotationRequestRepository.findByIngredientId(ingredient.getId());
//
//        QuotationRequest quotationRequest = new QuotationRequest();
//        for (QuotationRequest qReq: quotationRequests
//             ) {
//            if(qReq.getRequestStatus() == QuotationRequest.QRequestStatus.Send){
//                quotationRequest = qReq;
//            }
//        }
//
//        //close quotations
//        List<Quotation> quotations = quotationRepository.findByQuotationRequestNo(quotationRequest.getRequestNo());
//        for (Quotation quotation: quotations
//             ) {
//            if(quotation.getQuotationStatus()!=Quotation.QuotationStatus.Accepted){
//                quotationRepository.deleteById(quotation.getId());
//            }else {
//                quotation.setQuotationStatus(Quotation.QuotationStatus.Closed);
//                quotationRepository.save(quotation);
//            }
//        }
//
//        //close grn
//        goodReceiveNote.setGrnStatus(GoodReceiveNote.GRNStatus.Closed);
//        goodReceiveNoteRepository.save(goodReceiveNote);
//
//        //complete purchase order
//        purchaseOrder.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
//        purchaseOrderRepository.save(purchaseOrder);
//
//        //Update quantity and avg cost
//        Double currentAvgCost = ingredient.getAvgCost();
//        Double currentQuantity = ingredient.getQuantity();
//
//        Double pricePerUnit = purchaseOrder.getPricePerUnit();
//        Integer newQuantity = purchaseOrder.getQty();
//
//        Double newAvgCost;
//        if (currentAvgCost == null) {
//            newAvgCost = pricePerUnit;
//        } else {
//            newAvgCost = ((currentAvgCost * currentQuantity) + (pricePerUnit * newQuantity)) / (currentQuantity + newQuantity);
//        }
//
//        ingredient.setAvgCost(newAvgCost);
//        ingredient.setQuantity(currentQuantity + newQuantity);
//
//        ingredientRepository.save(ingredient);
//
//
//        return ResponseEntity.ok("Supplier Payment Made Successfully");
//    }

    @Override
    @Transactional
    public ResponseEntity<?> AddNewSupplierPayment(SupplierPaymentDTO supplierPaymentDTO, String userName) throws NoSuchAlgorithmException {

        // 1. Save the new Supplier Payment
        SupplierPayment newSupplierPayment = new SupplierPayment().mapDTO(null, supplierPaymentDTO, userName, goodReceiveNoteRepository, supplierPaymentRepository);

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

        // 3. Check if all GRNs under each Purchase Order are fully paid
//        for (PurchaseOrder po : affectedPurchaseOrders) {
//            boolean allGRNsPaid = goodReceiveNoteRepository.findByPurchaseOrder(po).stream()
//                    .allMatch(grn -> grn.getPaymentStatus() == GoodReceiveNote.PaymentStatus.Paid);
//
//            if (allGRNsPaid) {
//                po.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
//                purchaseOrderRepository.save(po);
//            }
//        }


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

//            // Process each Good Receive Note in the payment details
//            for (SupplierPaymentHasGoodReceiveNoteDTO paymentDetail : supplierPaymentDTO.getPaymentDetails()) {
//                GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findById(paymentDetail.getGoodReceiveNoteId()).orElse(null);
//
//                if (goodReceiveNote != null) {
//                    // Close the Good Receive Note
//                    goodReceiveNote.setGrnStatus(GoodReceiveNote.GRNStatus.Closed);
//                    goodReceiveNoteRepository.save(goodReceiveNote);
//
//                    // Mark the Purchase Order as Completed
//                    purchaseOrder.setPurchaseOrderStatus(PurchaseOrder.PurchaseOrderStatus.Completed);
//                    purchaseOrderRepository.save(purchaseOrder);
//                }
//            }

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





//    private PaymentMethod validateAndCreatePaymentMethod(SupplierPaymentDTO supplierPaymentDTO) {
//        if (supplierPaymentDTO.getPaymentMethod() == PaymentType.CASH) {
//            return paymentMethodRepository.save(
//                    new PaymentMethod(PaymentType.CASH, null));
//        }
//
//        if (request.getTransactionId() == null) {
//            throw new InvalidPaymentException("Transaction ID required for non-cash payments");
//        }
//
//        return paymentMethodRepository.findByMethodAndTransactionId(
//                        request.getPaymentMethod(), request.getTransactionId())
//                .orElseGet(() -> paymentMethodRepository.save(
//                        new PaymentMethod(request.getPaymentMethod(), request.getTransactionId())));
//    }


