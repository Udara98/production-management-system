package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface ICustomerService {
    ResponseEntity<?> AddNewCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllCustomers();
    ResponseEntity<?> DeleteCustomer(Integer id);
}
