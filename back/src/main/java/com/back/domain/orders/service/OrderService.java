package com.back.domain.orders.service;

import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.entity.Orders;
import com.back.domain.orders.repository.OrderRepository;
import com.back.domain.users.entity.Users;
import jakarta.persistence.EntityManager;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final EntityManager entityManager;

    // 주문 다건 조회
    public List<Orders> findAll() {
        return orderRepository.findAll();
    }

    public Optional<Orders> findById(int id) {
        return orderRepository.findById(id);
    }

    // 배송일 계산
    public LocalDate calculateDeliveryDate() {
        return LocalTime.now().isBefore(LocalTime.of(14, 0))
                ? LocalDate.now()
                : LocalDate.now().plusDays(1);
    }

    // 주문 등록
    public Orders create(int usersId, String address, String addressDetail, String postcode, int totalPrice) {
        LocalDate deliveryDate = calculateDeliveryDate();

        Users userId = entityManager.getReference(Users.class, 1);

        Orders order = new Orders(userId, address, addressDetail, postcode, totalPrice, deliveryDate);

        return orderRepository.save(order);
    }

    // 주문 삭제
    public void delete(Orders orders) {
        orderRepository.delete(orders);
    }

    // 주문 수정
    public void modify(Orders order, OrderStatus status, int totalPrice) {
        order.modify(status, totalPrice);
    }
}
