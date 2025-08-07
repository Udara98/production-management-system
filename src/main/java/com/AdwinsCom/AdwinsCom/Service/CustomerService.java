package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.Repository.BankAccountRepository;
import com.AdwinsCom.AdwinsCom.Repository.CustomerRepository;
import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.entity.BankAccount;
import com.AdwinsCom.AdwinsCom.entity.Customer;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;

import org.springframework.beans.factory.annotation.Autowired;
import com.AdwinsCom.AdwinsCom.Repository.CustomerOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import com.AdwinsCom.AdwinsCom.DTO.BankAccountDTO;
// If lombok @Setter is missing on CustomerDTO/BankAccountDTO, add it there.
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
public class CustomerService implements ICustomerService{

    final CustomerRepository customerRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public CustomerService(CustomerRepository customerRepository, CustomerOrderRepository customerOrderRepository) {
        this.customerRepository = customerRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    @Override
    public ResponseEntity<?> AddNewCustomer(CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException {

        // Authentication and authorization
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER");
          if (!loguserPrivi.get("insert")) {
              return ResponseEntity.status(HttpStatus.FORBIDDEN)
                      .body("Customer Add not Completed: You don't have permission!");
          }

        Customer exCustomer = customerRepository.findByNicAndBrn(customerDTO.getNic(), customerDTO.getBrn());
        if(exCustomer != null){
            return ResponseEntity.badRequest().body("Customer Already Exist.");
        }

      
        Customer newCustomer = new Customer();

        if (customerDTO.getNic() != null && !customerDTO.getNic().trim().isEmpty()) {
            if (customerRepository.existsByNic(customerDTO.getNic())) {
                return ResponseEntity.badRequest().body("A customer with this NIC already exists.");
            }
        }
        if (customerDTO.getBrn() != null && !customerDTO.getBrn().trim().isEmpty()) {
            if (customerRepository.existsByBrn(customerDTO.getBrn())) {
                return ResponseEntity.badRequest().body("A customer with this BRN already exists.");
            }
        }
        if (customerDTO.getEmail() != null && !customerDTO.getEmail().trim().isEmpty()) {
            if (customerRepository.existsByEmail(customerDTO.getEmail())) {
                return ResponseEntity.badRequest().body("A customer with this Email already exists.");
            }
        }
        if (customerDTO.getMobile() != null && !customerDTO.getMobile().trim().isEmpty()) {
            if (customerRepository.existsByMobile(customerDTO.getMobile())) {
                return ResponseEntity.badRequest().body("A customer with this Mobile number already exists.");
            }
        }
        // Generate RegNo automatically
        newCustomer.setRegNo(getNextCustomerRegNo());
        newCustomer.setBusinessType(customerDTO.getBusinessType());
        newCustomer.setCompanyName(customerDTO.getCompanyName());
        newCustomer.setBrn(customerDTO.getBrn());
        newCustomer.setContactPerson(customerDTO.getContactPerson());
        newCustomer.setFirstName(customerDTO.getFirstName());
        newCustomer.setSecondName(customerDTO.getSecondName());
        newCustomer.setNic(customerDTO.getNic());
        newCustomer.setRemainingCredit(customerDTO.getCreditLimit());
        newCustomer.setAddedUser(userName);
        newCustomer.setAddedDate(LocalDateTime.now());
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
          // Authentication and authorization
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER");
          if (!loguserPrivi.get("update")) {
              return ResponseEntity.status(HttpStatus.FORBIDDEN)
                      .body("Customer Update not Completed: You don't have permission!");
          }

        Customer customer = customerRepository.findById(customerDTO.getId()).get();
        Customer updatedCus = new Customer().mapDTO(customer, customerDTO, userName);
        customerRepository.save(updatedCus);
        return ResponseEntity.ok("Customer Updated Successfully");
    }



    @Override
    public ResponseEntity<?> GetAllCustomers() {
         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER");
         if (!loguserPrivi.get("select")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Customer GetAll not Completed: You don't have permission!");
         }

        List<Customer> customers = customerRepository.findAll();
        List<CustomerDTO> customerDTOs = customers.stream().map(customer -> {
            CustomerDTO dto = new CustomerDTO();
            dto.setId(customer.getId());
            dto.setRemainingCredit(customer.getRemainingCredit());
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
         // Authentication and authorization
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();
         HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "CUSTOMER");
         if (!loguserPrivi.get("delete")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body("Customer Delete not Completed: You don't have permission!");
         }

        // Prevent deletion if customer has orders
        if (customerOrderRepository.existsByCustomerId(id)) {
            return ResponseEntity.badRequest().body("Cannot delete customer: Customer has existing orders.");
        }
        customerRepository.deleteById(id);
        return ResponseEntity.ok("Customer Deleted Successfully");
    }
}
