package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Privilege {

    @Column(name = "id", unique = true)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sel")
    @NotNull
    private Boolean sel;

    @Column(name = "ins")
    @NotNull
    private Boolean ins;

    @Column(name = "upd")
    @NotNull
    private Boolean upd;

    @Column(name = "del")
    @NotNull
    private Boolean del;

    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id" )
    private Role role_id;

    @ManyToOne
    @JoinColumn(name = "module_id", referencedColumnName = "id")
    private Module module_id;

    @Column(name = "addeddatetime")
    @NotNull
    private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    @Column(name = "addeduser")
    @NotNull
    private Integer addeduser;

    @Column(name = "modifieduser")
    private Integer modifieduser;

    @Column(name = "deleteduser")
    private Integer deleteduser;


}
