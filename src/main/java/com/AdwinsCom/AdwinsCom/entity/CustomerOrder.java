package com.AdwinsCom.AdwinsCom.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "customer_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrder {

    public enum OrderStatus{
        NotAssigned, 
        Completed,
        Pending,
        Assigned,
        Canceled
    }

    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_no")
    private String orderNo;

    @Column(name = "invoice_no", unique = true)
    private String invoiceNo;

    @ManyToOne
    @JoinColumn(name = "customer_id" ,referencedColumnName = "id")
    private Customer customer;

    @Column(name = "required_date")
    private LocalDateTime requiredDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "cus_order_id")
    @JsonManagedReference
    private List<CustomerOrderProduct> customerOrderProducts;

    private Integer addeduser;

    private LocalDateTime addeddate;

    private Integer lastmodifieduser;

    private LocalDateTime lastmodifieddatetime;

    private Integer deleteduser;

    private LocalDateTime deleteddatetime;

    @Column(name = "order_status")
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Transient
    private Double outstanding;

    public Double getOutstanding() {
        return outstanding;
    }

    public void setOutstanding(Double outstanding) {
        this.outstanding = outstanding;
    }
}
