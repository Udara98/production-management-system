package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // make as persistence entity
@Table(name = "employeestatus")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class EmployeeStatus {

    @Id // pk
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI
    @Column(name = "Id")
    private Integer id;

    @Column(name = "name")
    @NotNull
    private String name;

}
