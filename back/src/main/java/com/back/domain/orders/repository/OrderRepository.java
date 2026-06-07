package com.back.domain.orders.repository;

import com.back.domain.orders.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Integer> {
    List<Orders> findByUserIdAndDeliveryDate(int userId, LocalDate deliveryDate);
}
