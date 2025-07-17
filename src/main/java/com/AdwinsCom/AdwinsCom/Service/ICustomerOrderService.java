package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import com.AdwinsCom.AdwinsCom.DTO.CustomerSalesSummaryDTO;
import com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.List;

public interface ICustomerOrderService {
    List<CustomerSalesSummaryDTO> getCustomerSalesSummary(LocalDate startDate, LocalDate endDate);
    List<ProductSalesSummaryDTO> getProductSalesSummary(LocalDate startDate, LocalDate endDate);
    ResponseEntity<?> AddNewCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName);
    ResponseEntity<?> GetAllCustomerOrders();
    ResponseEntity<?> DeleteCustomerOrder(Integer id);
    ResponseEntity<?> gtAllUnpaidCustomerOrders();
    ResponseEntity<?> getUnpaidOrdersByCustomer(Integer customerId);
    com.AdwinsCom.AdwinsCom.entity.CustomerOrder getOrderEntityById(Integer id);

}
