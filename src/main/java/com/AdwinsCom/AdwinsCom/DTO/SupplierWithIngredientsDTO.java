package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierWithIngredientsDTO {
    private BankAccountDTO bankAccount;
    private Integer id;
    private String regNo;
    // Business type logic (COMPANY or INDIVIDUAL)
    private String businessType; // "COMPANY" or "INDIVIDUAL"
    // Company fields
    private String companyName; // Business Name (Company)
    private String brn; // Business Registration Number (Company)
    private String contactPerson; // Contact Person Name (Company)
    // Individual fields
    private String firstName; // First Name (Individual)
    private String secondName; // Second Name (Individual)
    private String nic; // NIC (Individual)
    // Common fields
    private String contactNo;
    private String email;
    private String address;
    private String note;
    private LocalDate joinDate;
    private Supplier.SupplierStatus supplierStatus;
    private String addedUser;
    private LocalDateTime addedDate;
    private String updatedUser;
    private LocalDateTime updatedDate;
    private List<Ingredient> ingredients;
    private String supplierName;
    private String contactPersonName;
}
