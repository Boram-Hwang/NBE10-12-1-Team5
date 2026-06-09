package com.back.domain.order.repository;

import com.back.domain.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdAndDeliveryDate(int userId, LocalDate deliveryDate);
}
