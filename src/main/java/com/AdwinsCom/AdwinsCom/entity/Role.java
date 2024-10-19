package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // make as persistence entity
@Table(name = "role")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id // pk
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI
    @Column(name = "Id",unique = true)
    private Integer id;

    @Column(name = "name")
    @NotNull
    private String name;
}
