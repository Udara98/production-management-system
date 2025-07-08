package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.Repository.CustomerRepository;
import com.AdwinsCom.AdwinsCom.entity.Customer;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class CustomerService implements ICustomerService{

    final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public ResponseEntity<?> AddNewCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException {
        Customer exCustomer = customerRepository.findByNicAndBrn(customerDTO.getNic(), customerDTO.getBrn());
        if(exCustomer != null){
            return ResponseEntity.badRequest().body("Customer Already Exist.");
        }
        Customer newCustomer = new Customer().mapDTO(null, customerDTO, userName);
        customerRepository.save(newCustomer);
        return ResponseEntity.ok("Customer Added Successfully");
    }
    @Override
    public ResponseEntity<?> UpdateCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException {
        Customer customer = customerRepository.findById(customerDTO.getId()).get();
        Customer updatedCus = new Customer().mapDTO(customer, customerDTO, userName);
        customerRepository.save(updatedCus);
        return ResponseEntity.ok("Customer Updated Successfully");
    }



    @Override
    public ResponseEntity<?> GetAllCustomers() {

        List<Customer> customers = customerRepository.findAll();
        return ResponseEntity.ok(customers);
    }

    @Override
    public ResponseEntity<?> DeleteCustomer(Integer id) {
        return null;
    }
}
