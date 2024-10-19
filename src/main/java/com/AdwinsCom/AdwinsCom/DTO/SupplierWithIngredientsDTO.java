package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Ingredient;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierWithIngredientsDTO {
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
    private String addedUser;
    private LocalDateTime addedDate;
    private String updatedUser;
    private LocalDateTime updatedDate;
    private List<Ingredient> ingredients;

}
