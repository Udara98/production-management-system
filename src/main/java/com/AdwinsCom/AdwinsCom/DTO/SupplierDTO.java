package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierDTO {
    private Integer id;
    private String regNo;
    private String businessType; 
    private String companyName; 
    private String brn; 
    private String contactPerson; 
    private String firstName;   
    private String secondName;
    private String nic; 
    private String contactNo;
    private String email;
    private String address;
    private String note;
    private LocalDate joinDate;
    private Supplier.SupplierStatus supplierStatus;
    private Set<Ingredient> ingredients;
    private BankAccountDTO bankAccount;
    private Double creditLimit;
    private String supplierName;
    private String contactPersonName;
}
