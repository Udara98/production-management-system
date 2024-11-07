package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import com.AdwinsCom.AdwinsCom.Repository.CustomerPaymentRepository;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;
@Service
public class CustomerPaymentService implements ICustomerPaymentService{

    final CustomerPaymentRepository customerPaymentRepository;

    @Autowired
    public CustomerPaymentService(CustomerPaymentRepository customerPaymentRepository) {
        this.customerPaymentRepository = customerPaymentRepository;
    }

    @Override
    public ResponseEntity<?> AddNewCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName) {
        CustomerPayment exPayment = customerPaymentRepository.findByOrder(customerPaymentDTO.getOrder());
        if(exPayment!=null){
            return ResponseEntity.badRequest().body("Payment Already Made.");
        }
        CustomerPayment newCusPayment = new CustomerPayment().mapDTO(null,customerPaymentDTO,userName);
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
}
