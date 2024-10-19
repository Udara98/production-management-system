package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Customer;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrderProduct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderDTO {
    private Customer customer;
    private LocalDateTime requiredDate;
    private Double totalAmount;
    private List<CustomerOrderProduct> customerOrderProducts;
    private CustomerOrder.OrderStatus orderStatus;
}
