package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Customer findByNicAndBrn(String nic, String brn);

    @Query("SELECT MAX(i.regNo) FROM Customer i")
    String getMaxCustomerRegNo();

    Boolean existsByNic(String nic);

    Boolean existsByBrn(String brn);

    Boolean existsByMobile(String mobile);

    Boolean existsByEmail(String email);



}
