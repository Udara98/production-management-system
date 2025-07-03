package com.AdwinsCom.AdwinsCom.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", unique = true)
    @NotNull
    private String username;

    @Column(name = "password")
    @NotNull
    private String password;

    @Column(name = "email", unique = true)
    @NotNull
    private String email;

    @Column(name = "status")
    @NotNull
    private Boolean status;

    @Column(name = "added_datetime")
    @NotNull
    private LocalDateTime added_datetime;

    @Column(name = "note")
    private String note;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    @Column(name = "createduser")
    private Integer createduser;

    @Column(name = "modifieduser")
    private Integer modifieduser;

    @Column(name = "deleteduser")
    private Integer deleteduser;

    private byte[] photo;

    private String photoname;



    @ManyToOne
    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    private Employee employee_id;

    //User and role has many-to-many relationship
    @ManyToMany(cascade = CascadeType.MERGE)
    @JoinTable(name = "role_has_user", joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

    public User(Integer id, String username){
        this.id = id;
        this.username = username;
    }



}
