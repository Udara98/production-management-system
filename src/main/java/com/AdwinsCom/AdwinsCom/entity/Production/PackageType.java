package com.AdwinsCom.AdwinsCom.entity.Production;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "package_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageType {

    @Id
    @Column(name = "id", unique = true)
    private String id;

    @Column(name = "name")
    @NonNull
    private String name;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @JoinColumn(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
