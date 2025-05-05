package com.AdwinsCom.AdwinsCom.Repository;
import com.AdwinsCom.AdwinsCom.entity.PaymentMethodSup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentMethodSupRepository extends JpaRepository<PaymentMethodSup, Integer> {
}
