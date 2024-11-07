package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Integer> {

    CustomerPayment findByOrder(CustomerOrder order);

    //Define query for get unpaid customer payments
    @Query("SELECT cp FROM CustomerPayment cp WHERE cp.paidAmount < cp.totalAmount")
     List<CustomerPayment> gtAllUnpaidCustomerPayments();
}
