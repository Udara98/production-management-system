package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierDTO {
    private Integer id;
    private String regNo;
    private String supplierName;
    private String contactPersonName;
    private String contactNo;
    private String email;
    private String address;
    private String note;
    private LocalDateTime joinDate;
    private Supplier.SupplierStatus supplierStatus;
    private Set<Ingredient> ingredients;
}
