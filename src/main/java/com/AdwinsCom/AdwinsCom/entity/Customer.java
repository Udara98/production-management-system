package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.CustomerDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;


@Entity
@Table(name = "customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Column(name = "business_type")
    private String businessType; // COMPANY or INDIVIDUAL
    @Column(name = "contact_person")
    private String contactPerson; // Only for company
    @Column(name = "credit_limit")
    private Double creditLimit; // Always present for both types
    @Column(name = "first_name")
    private String firstName; // Only for individual
    @Column(name = "second_name")
    private String secondName; // Only for individual


    public enum CustomerStatus{
        Active,
        InActive
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "reg_no")
    private String regNo;

    @Column(name = "f_name")
    private String fName;

    @Column(name = "s_name")
    private String sName;

    @Column(name = "nic")
    private String nic;

    @Column(name = "mobile")
    private String mobile;

    @Column(name = "land_no")
    private String landNo;

    @Column(name = "email")
    private String email;

    @Column(name = "address")
    private String address;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "brn")
    private String brn;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private BankAccount bankAccount;

    @Column(name = "customer_status")
    @Enumerated(EnumType.STRING)
    private CustomerStatus customerStatus;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public Customer mapDTO(Customer customer, CustomerDTO customerDTO, String userName) throws NoSuchAlgorithmException {
        Customer newCustomer = new Customer();
        if(customer != null){
            newCustomer = customer;
            newCustomer.setUpdatedUser(userName);
            newCustomer.setUpdatedDate(LocalDateTime.now());
        }else{
            newCustomer.setRegNo(QuotationRequest.generateUniqueId("CUS-"));
            newCustomer.setAddedUser(userName);
            newCustomer.setAddedDate(LocalDateTime.now());
        }
        newCustomer.setBusinessType(customerDTO.getBusinessType());
        newCustomer.setCompanyName(customerDTO.getCompanyName());
        newCustomer.setBrn(customerDTO.getBrn());
        newCustomer.setContactPerson(customerDTO.getContactPerson());
        newCustomer.setFirstName(customerDTO.getFirstName());
        newCustomer.setSName(customerDTO.getSecondName());
        newCustomer.setNic(customerDTO.getNic());
        newCustomer.setMobile(customerDTO.getMobile());
        newCustomer.setLandNo(customerDTO.getLandNo());
        newCustomer.setEmail(customerDTO.getEmail());
        newCustomer.setAddress(customerDTO.getAddress());
        newCustomer.setCreditLimit(customerDTO.getCreditLimit());
        newCustomer.setCustomerStatus(customerDTO.getCustomerStatus());

        // Map BankAccountDTO to BankAccount entity
        BankAccount bankAccount = null;
        if (customerDTO.getBankAccount() != null) {
            bankAccount = new BankAccount();
            bankAccount.setBankName(customerDTO.getBankAccount().getBankName());
            bankAccount.setBankBranch(customerDTO.getBankAccount().getBankBranch());
            bankAccount.setAccountNo(customerDTO.getBankAccount().getAccountNo());
            bankAccount.setAccountName(customerDTO.getBankAccount().getAccountName());
            bankAccount.setCustomer(newCustomer);
            newCustomer.setBankAccount(bankAccount);
        }
        return newCustomer;
    }

}
