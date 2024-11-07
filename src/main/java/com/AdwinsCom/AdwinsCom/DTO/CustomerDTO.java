package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Integer id;
    private String firstName;
    private String surname;
    private String nic;
    private String mobile;
    private String landNo;
    private String email;
    private String address;
    private String companyName;
    private String brn;
    private Double point;
    private Customer.CustomerStatus customerStatus;

}
