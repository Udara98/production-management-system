package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import com.AdwinsCom.AdwinsCom.Repository.CustomerOrderRepository;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class CustomerOrderService implements ICustomerOrderService{

    final CustomerOrderRepository customerOrderRepository;

    public CustomerOrderService(CustomerOrderRepository customerOrderRepository) {
        this.customerOrderRepository = customerOrderRepository;
    }

    @Override
    public ResponseEntity<?> AddNewCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) throws NoSuchAlgorithmException {

        CustomerOrder newCustomerOrder = new CustomerOrder().mapDTO(null, customerOrderDTO,userName);

        customerOrderRepository.save(newCustomerOrder);

        return ResponseEntity.ok("Customer Order Placed Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) {
        return null;
    }

    @Override
    public ResponseEntity<?> GetAllCustomerOrders() {
        List<CustomerOrder> customerOrders = customerOrderRepository.findAll();
        return ResponseEntity.ok(customerOrders);
    }

    @Override
    public ResponseEntity<?> gtAllUnpaidCustomerOrders() {
        List<CustomerOrder> unpaidCustomerOrders = customerOrderRepository.gtAllUnpaidCustomerOrders();
        return ResponseEntity.ok(unpaidCustomerOrders);
    }

    @Override
    public ResponseEntity<?> DeleteCustomerOrder(Integer id) {
        return null;
    }
}
