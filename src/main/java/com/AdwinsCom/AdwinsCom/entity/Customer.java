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

    @Column(name = "points")
    private Double points;

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
        newCustomer.setFName(customerDTO.getFirstName());
        newCustomer.setSName(customerDTO.getSurname());
        newCustomer.setNic(customerDTO.getNic());
        newCustomer.setMobile(customerDTO.getMobile());
        newCustomer.setLandNo(customerDTO.getLandNo());
        newCustomer.setEmail(customerDTO.getEmail());
        newCustomer.setAddress(customerDTO.getAddress());
        newCustomer.setCompanyName(customerDTO.getCompanyName());
        newCustomer.setBrn(customerDTO.getBrn());
        newCustomer.setPoints(customerDTO.getPoint());
        newCustomer.setCustomerStatus(customerDTO.getCustomerStatus());

        return newCustomer;
    }

}
