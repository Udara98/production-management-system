package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Integer id;
    private String regNo;
    private String businessType; // "COMPANY" or "INDIVIDUAL"
    private String companyName; // Business Name (Company)
    private String brn; // Business Registration Number (Company)
    private String contactPerson; // Contact Person Name (Company)
    private String firstName; // First Name (Individual)
    private String secondName; // Second Name (Individual)
    private String nic; // NIC (Individual)
    private String mobile;
    private String landNo;
    private String email;
    private String address;
    private Double creditLimit;
    private Customer.CustomerStatus customerStatus;
    private BankAccountDTO bankAccount;
}
