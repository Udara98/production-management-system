package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Integer> {

    CustomerPayment findByOrder(CustomerOrder order);
}
