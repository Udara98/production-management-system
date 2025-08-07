package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quotation_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationRequest {

    public enum QRequestStatus{
        Send,
        Closed,
        Removed
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="request_no")
    @NotNull
    private String requestNo;

    @Column(name="ingredient_id")
    @NotNull
    private Integer ingredientId;

    @Column(name = "request_date")
    @NotNull
    private LocalDateTime requestDate;

    @ElementCollection
    @CollectionTable(name = "quotation_request_suppliers", joinColumns = @JoinColumn(name = "quotation_request_id"))
    @Column(name = "suppliers")
    private List<String> suppliers;


    @Column(name = "request_status")
    @Enumerated(EnumType.STRING)
    @NotNull
    private QRequestStatus requestStatus = QRequestStatus.Send;

    @Column(name = "added_user")
    @NotNull
    private String addedUser;

    @Column(name = "added_date")
    @NotNull
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "quantity")
    @NotNull
    private Double quantity;

    @Column(name = "unit_type")
    @NotNull
    private String unitType;

    @Column(name = "required_delivery_date")
    @NotNull
    private LocalDate requiredDeliveryDate;

    @Column(name = "deadline")
    @NotNull
    private LocalDate deadline;

    @Column(name = "note")
    private String note;



    public static String generateUniqueId(String prefix) throws NoSuchAlgorithmException {
        long timestamp = Instant.now().toEpochMilli();
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(ByteBuffer.allocate(Long.BYTES).putLong(timestamp).array());

        int hashInt = ByteBuffer.wrap(hash).getInt();
        int uniqueId = Math.abs(hashInt % 1000000);

        return prefix+uniqueId;
    }
}
