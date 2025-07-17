package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.Repository.BankAccountRepository;
import com.AdwinsCom.AdwinsCom.Repository.CustomerRepository;
import com.AdwinsCom.AdwinsCom.entity.BankAccount;
import com.AdwinsCom.AdwinsCom.entity.Customer;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.DTO.BankAccountDTO;
// If lombok @Setter is missing on CustomerDTO/BankAccountDTO, add it there.
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class CustomerService implements ICustomerService{

    final CustomerRepository customerRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public ResponseEntity<?> AddNewCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException {
        Customer exCustomer = customerRepository.findByNicAndBrn(customerDTO.getNic(), customerDTO.getBrn());
        if(exCustomer != null){
            return ResponseEntity.badRequest().body("Customer Already Exist.");
        }
        // Customer newCustomer = new Customer().mapDTO(null, customerDTO, userName);
        // customerRepository.save(newCustomer);
        Customer newCustomer = new Customer();
        // Generate RegNo automatically
        newCustomer.setRegNo(getNextCustomerRegNo());
        newCustomer.setBusinessType(customerDTO.getBusinessType());
        newCustomer.setCompanyName(customerDTO.getCompanyName());
        newCustomer.setBrn(customerDTO.getBrn());
        newCustomer.setContactPerson(customerDTO.getContactPerson());
        newCustomer.setFirstName(customerDTO.getFirstName());
        newCustomer.setSecondName(customerDTO.getSecondName());
        newCustomer.setNic(customerDTO.getNic());
        newCustomer.setMobile(customerDTO.getMobile());
        newCustomer.setLandNo(customerDTO.getLandNo());
        newCustomer.setEmail(customerDTO.getEmail());
        newCustomer.setAddress(customerDTO.getAddress());
        newCustomer.setCreditLimit(customerDTO.getCreditLimit());
        newCustomer.setCustomerStatus(customerDTO.getCustomerStatus());

        // 1. Save the customer first (without bank account)
        Customer savedCustomer = customerRepository.save(newCustomer);

        // Save bank account if present
        if (customerDTO.getBankAccount() != null) {
            BankAccountDTO bankAccountDTO = customerDTO.getBankAccount();
            BankAccount bankAccount = new BankAccount();
            bankAccount.setBankName(bankAccountDTO.getBankName());
            bankAccount.setBankBranch(bankAccountDTO.getBankBranch());
            bankAccount.setAccountNo(bankAccountDTO.getAccountNo());
            bankAccount.setAccountName(bankAccountDTO.getAccountName());
            bankAccount.setCustomer(savedCustomer);
            bankAccountRepository.save(bankAccount);
            
            // If Customer has a single bankAccount field (not a list), set it and save again
            savedCustomer.setBankAccount(bankAccount);
            customerRepository.save(savedCustomer);
        }

        return ResponseEntity.ok("Customer Added Successfully");
    }

     public String getNextCustomerRegNo() {
        String maxCode = customerRepository.getMaxCustomerRegNo(); 
        int nextNumber = 1;
        if (maxCode != null && maxCode.startsWith("CUS-")) {
            nextNumber = Integer.parseInt(maxCode.substring(4)) + 1;
        }
        return String.format("CUS-%04d", nextNumber);
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
        List<CustomerDTO> customerDTOs = customers.stream().map(customer -> {
            CustomerDTO dto = new CustomerDTO();
            dto.setId(customer.getId());
            dto.setBusinessType(customer.getBusinessType());
            dto.setCompanyName(customer.getCompanyName());
            dto.setBrn(customer.getBrn());
            dto.setContactPerson(customer.getContactPerson());
            dto.setFirstName(customer.getFirstName());
            dto.setSecondName(customer.getSecondName());
            dto.setNic(customer.getNic());
            dto.setMobile(customer.getMobile());
            dto.setLandNo(customer.getLandNo());
            dto.setEmail(customer.getEmail());
            dto.setAddress(customer.getAddress());
            dto.setCreditLimit(customer.getCreditLimit());
            dto.setCustomerStatus(customer.getCustomerStatus());
            dto.setRegNo(customer.getRegNo());
            // Map bank account
            if (customer.getBankAccount() != null) {
                BankAccountDTO bankDTO = new BankAccountDTO();
                bankDTO.setId(customer.getBankAccount().getId());
                bankDTO.setBankName(customer.getBankAccount().getBankName());
                bankDTO.setBankBranch(customer.getBankAccount().getBankBranch());
                bankDTO.setAccountNo(customer.getBankAccount().getAccountNo());
                bankDTO.setAccountName(customer.getBankAccount().getAccountName());
                dto.setBankAccount(bankDTO);
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(customerDTOs);
    }

    @Override
    public ResponseEntity<?> DeleteCustomer(Integer id) {
        return null;
    }
}
