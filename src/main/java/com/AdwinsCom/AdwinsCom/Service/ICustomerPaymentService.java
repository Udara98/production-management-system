package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerPaymentDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface ICustomerPaymentService {
    ResponseEntity<?> AddNewCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateCustomerPayment(CustomerPaymentDTO customerPaymentDTO, String userName);
    ResponseEntity<?> GetAllCustomerPayments();
    ResponseEntity<?> GetAllUnpaidCustomerPayments();
    ResponseEntity<?>getLatestCompletedPaymentByOrderId(Integer id);


    CustomerPaymentDTO getCustomerPaymentById(int id);
}
