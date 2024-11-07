package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface ICustomerOrderService {
    ResponseEntity<?> AddNewCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName);
    ResponseEntity<?> GetAllCustomerOrders();
    ResponseEntity<?> DeleteCustomerOrder(Integer id);
    ResponseEntity<?>gtAllUnpaidCustomerOrders();
}
