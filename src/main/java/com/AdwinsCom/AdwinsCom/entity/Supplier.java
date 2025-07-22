package com.AdwinsCom.AdwinsCom.entity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "supplier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    public enum SupplierStatus{
        Active,
        InActive,
        Removed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "reg_no", unique = true)
    @NotNull
    private String regNo;

    @Column(name = "business_type")
    private String businessType; 

    @Column(name = "company_name")
    private String companyName; 

    @Column(name = "brn")
    private String brn; 

    @Column(name = "first_name")
    private String firstName; 

    @Column(name = "second_name")
    private String secondName;

    @Column(name = "nic")
    private String nic;

    @Column(name = "contact_no")
    @NotNull
    private String contactNo;

    @Column(name = "email", unique = true)
    @NotNull
    private String email;

    @Column(name = "contact_person_name")
    private String contactPersonName;

    @Column(name = "address")
    @NotNull
    private String address;

    @Column(name = "note")
    private String note;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "supplier_status")
    @Enumerated(EnumType.STRING)
    private SupplierStatus supplierStatus;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "supplier_ingredients",
            joinColumns = @JoinColumn(name = "supplier_id"),
            inverseJoinColumns = @JoinColumn(name = "ingredient_id"))
    private Set<Ingredient> ingredients;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BankAccount> bankAccounts = new ArrayList<>();

    // Deprecated fields for backward compatibility (to be removed later)
    @Column(name = "supplier_name")
    private String supplierName;

}

