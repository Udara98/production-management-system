package com.AdwinsCom.AdwinsCom.entity;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.NoSuchAlgorithmException;
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

    public CustomerOrder mapDTO(CustomerOrder customerOrder, CustomerOrderDTO customerOrderDTO, String userName) throws NoSuchAlgorithmException {
        CustomerOrder newCustomerOrder = new CustomerOrder();
        if(customerOrder != null){
            newCustomerOrder = customerOrder;
            newCustomerOrder.setUpdatedUser(userName);
            newCustomerOrder.setUpdatedDate(LocalDateTime.now());
        }else{
            newCustomerOrder.setOrderNo(QuotationRequest.generateUniqueId("ODR-"));
            newCustomerOrder.setAddedDate(LocalDateTime.now());
            newCustomerOrder.setAddedUser(userName);
        }
        newCustomerOrder.setRequiredDate(customerOrderDTO.getRequiredDate());
        newCustomerOrder.setCustomer(customerOrderDTO.getCustomer());
        newCustomerOrder.setTotalAmount(customerOrderDTO.getTotalAmount());
        newCustomerOrder.setCustomerOrderProducts(customerOrderDTO.getCustomerOrderProducts());
        newCustomerOrder.setOrderStatus(customerOrderDTO.getOrderStatus());

        return newCustomerOrder;
    }

}
