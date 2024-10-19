package com.AdwinsCom.AdwinsCom.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.validator.constraints.Length;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity // make as an persistence entity
@Table(name = "employee") // for map table name
@Data // generate getters, setters, tostring

@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id // PK
    @Column(name = "id", unique = true) // column mapping
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI
    private Integer id;

    @Column(name = "empnumber", unique = true, length = 10)
    @NotNull // not null
    private String empnumber;

    @Column(name = "fullname")
    @NotNull
    private String fullname;

    @Column(name = "nic", unique = true, length = 12)
    @NotNull
    // validate through @Length
    @Length(max = 12, min = 10, message = "nic value must have 10 or 12 length")
    private String nic;

    @Column(name = "callingname")
    @NotNull
    private String callingname;

    // default - eager , *can convert to lazy
    // @ManyToOne(fetch = FetchType.LAZY)
    @ManyToOne
    @JoinColumn(name = "employeestatus_id", referencedColumnName = "id")
    private EmployeeStatus employeestatus_id;

    @ManyToOne
    @JoinColumn(name = "designation_id", referencedColumnName = "id")
    private Designation designation_id;

    @Column(name = "email", unique = true)
    @NotNull
    private String email;

    @Column(name = "mobile", length = 10)
    @NotNull
    @Length(min = 10, max = 10, message = "mobile value must have 10 length")
    private String mobile;

    @Column(name = "landno", length = 10)
    private String landno;

    @Column(name = "note")
    private String note;

    @Column(name = "dob")
    @NotNull
    private LocalDate dob;

    @Column(name = "civilstatus")
    @NotNull
    private String civilstatus;

    @Column(name = "address")
    @NotNull
    private String address;

    @Column(name = "added_datetime")
    @NotNull
    private LocalDateTime added_datetime;

    @Column(name = "gender")
    @NotNull
    private  String gender;


}
