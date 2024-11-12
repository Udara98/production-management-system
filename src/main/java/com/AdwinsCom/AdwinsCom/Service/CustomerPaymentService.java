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

    @Override
    public ResponseEntity<?> AddNewCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER_PAYMENT");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Payment Adds not Completed: You don't have permission!");
        }

        CustomerPayment newCusPayment = new CustomerPayment().mapDTO(null,customerPaymentDTO,auth.getName());
        customerPaymentRepository.save(newCusPayment);

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
