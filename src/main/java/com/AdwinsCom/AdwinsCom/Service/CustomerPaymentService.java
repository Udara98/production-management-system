package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import com.AdwinsCom.AdwinsCom.Repository.CustomerPaymentRepository;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerPaymentService implements ICustomerPaymentService{

    final CustomerPaymentRepository customerPaymentRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public CustomerPaymentService(CustomerPaymentRepository customerPaymentRepository) {
        this.customerPaymentRepository = customerPaymentRepository;
    }

    @Autowired
    private com.AdwinsCom.AdwinsCom.Repository.CustomerOrderRepository customerOrderRepository;

    private String generateNextReceiptNo() {
        String prefix = "REC-";
        int nextNumber = 1;
        CustomerPayment lastPayment = customerPaymentRepository.findTopByOrderByIdDesc();
        if (lastPayment != null && lastPayment.getReceiptNo() != null) {
            String lastReceiptNo = lastPayment.getReceiptNo();
            try {
                String numberPart = lastReceiptNo.replace(prefix, "");
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                // fallback: start from 1
                nextNumber = 1;
            }
        }
        return String.format("%s%05d", prefix, nextNumber);
    }

    @Override
    public ResponseEntity<?> AddNewCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName) {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER_PAYMENT");
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Payment Adds not Completed: You don't have permission!");
        }

        // Map DTO to Entity
        CustomerPayment newCustomerPayment = new CustomerPayment();
        newCustomerPayment.setAddedUser(userName);
        newCustomerPayment.setAddedDate(java.time.LocalDateTime.now());
        // Generate receiptNo if not set
        String receiptNo = customerPaymentDTO.getReceiptNo();
        if (receiptNo == null || receiptNo.isEmpty()) {
            receiptNo = generateNextReceiptNo();
        }
        newCustomerPayment.setReceiptNo(receiptNo);
        newCustomerPayment.setPaymentDate(customerPaymentDTO.getPaymentDate());
        newCustomerPayment.setTotalAmount(customerPaymentDTO.getTotalAmount());
        newCustomerPayment.setPaymentStatus(customerPaymentDTO.getPaymentStatus());
        newCustomerPayment.setPaymentMethod(customerPaymentDTO.getPaymentMethod());
        newCustomerPayment.setTransferid(customerPaymentDTO.getTransferid());
        newCustomerPayment.setBalance(customerPaymentDTO.getBalance());
        newCustomerPayment.setPayAmount(customerPaymentDTO.getPayAmount());

        // Map payment details
        java.util.List<com.AdwinsCom.AdwinsCom.entity.CustomerPaymentHasOrder> details = new java.util.ArrayList<>();
        if (customerPaymentDTO.getPaymentDetails() != null) {
            for (com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentHasOrderDTO dto : customerPaymentDTO.getPaymentDetails()) {
                com.AdwinsCom.AdwinsCom.entity.CustomerPaymentHasOrder entity = new com.AdwinsCom.AdwinsCom.entity.CustomerPaymentHasOrder();
                // Fetch order entity by ID
                com.AdwinsCom.AdwinsCom.entity.CustomerOrder order = customerOrderRepository.findById(dto.getOrderId().intValue())
                        .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + dto.getOrderId()));
                entity.setOrder(order);
                entity.setPaidAmount(dto.getPaidAmount());
                entity.setBalance(dto.getBalance());
                // Set parent payment if needed
                entity.setCustomerPayment(newCustomerPayment);
                details.add(entity);
            }
        }
        newCustomerPayment.setPaymentDetails(details);
        customerPaymentRepository.save(newCustomerPayment);
        return ResponseEntity.ok("Payment Made Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName) {
        return null;
    }

    @Override
    public ResponseEntity<?> GetAllCustomerPayments() {
        List<CustomerPayment> customerPayments = customerPaymentRepository.findAll();
        return ResponseEntity.ok(customerPayments);
    }

    @Override
    public ResponseEntity<?>GetAllUnpaidCustomerPayments(){
        List<CustomerPayment> unpaidCustomerPayments = customerPaymentRepository.gtAllUnpaidCustomerPayments();
        return ResponseEntity.ok(unpaidCustomerPayments);
    }

    @Override
    public ResponseEntity<?> getLatestCompletedPaymentByOrderId(Integer orderId) {
        Optional<CustomerPayment> latestCompletedCP = customerPaymentRepository.getLatestCompletedPaymentByOrderId(orderId);

        if (latestCompletedCP == null) {
            // No payment found for the given order ID
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No completed payment found for this order ID.");
        }

        return ResponseEntity.ok(latestCompletedCP);
    }

}
