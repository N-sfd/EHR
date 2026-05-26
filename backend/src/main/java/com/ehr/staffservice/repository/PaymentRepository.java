package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStatement_StatementIdOrderByPaymentDateDesc(Long statementId);
}

