package com.AdwinsCom.AdwinsCom.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrder {

    public enum OrderStatus{
        Pending,
        Completed,
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
    private List<CustomerOrderProduct> customerOrderProducts;

    @Column(name = "added_user")
    private String addedUser;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "updated_user")
    private String updatedUser;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

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
