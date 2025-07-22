package com.AdwinsCom.AdwinsCom.DTO;

import com.AdwinsCom.AdwinsCom.entity.Customer;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderDTO {
    private Integer customerId;
    private LocalDateTime requiredDate;
    private List<CustomerOrderProductDTO> customerOrderProducts;
    private CustomerOrder.OrderStatus orderStatus;
    private LocalDateTime added;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerOrderProductDTO {
        private Integer productId;
        private Integer quantity;
    }
}
