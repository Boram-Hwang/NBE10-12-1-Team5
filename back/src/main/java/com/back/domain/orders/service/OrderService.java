package com.back.domain.orders.service;

import com.back.domain.orderitems.dto.OrderItemRequest;
import com.back.domain.orderitems.service.OrderItemService;
import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.entity.Orders;
import com.back.domain.orders.repository.OrderRepository;
import com.back.domain.users.entity.Users;
import com.back.domain.users.service.UserService;
import jakarta.persistence.EntityManager;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final OrderItemService orderItemService;

    public long count() { return orderRepository.count(); }

    // 주문 다건 조회
    public List<Orders> findAll() {
        return orderRepository.findAll();
    }

    public Orders findById(int id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "해당 %d번 주문이 없습니다.".formatted(id)
        ));
    }

    // 배송일 계산
    public LocalDate calculateDeliveryDate() {
        return LocalTime.now().isBefore(LocalTime.of(14, 0))
                ? LocalDate.now()
                : LocalDate.now().plusDays(1);
    }



    // 주문 등록
    public Orders create(int usersId, String address, String addressDetail, String postcode, int totalPrice, List<OrderItemRequest> orderItemReq) {

        LocalDate deliveryDate = calculateDeliveryDate();

        // User 번호 받아와서 등록
        Users userId = userService.findById(usersId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객입니다."));

        Orders orders = new Orders(
                userId,
                address,
                addressDetail,
                postcode,
                totalPrice,
                deliveryDate
        );

        // 주문 저장
        Orders saveOrder = orderRepository.save(orders);
        orderItemService.saveOrderItems(saveOrder.getId(), orderItemReq);

        return saveOrder;
    }

    // 주문 삭제
    public void delete(Orders orders) {
        orderItemService.deleteOrderItems(orders.getId());
        orderRepository.delete(orders);
    }

    // 주문 수정
    public void modify(Orders order, OrderStatus status) {
        if(status.equals(OrderStatus.CANCELED))
            orderItemService.restoreInventory(order.getId());
        else
            order.modifyStatus(status);
    }

    public List<Orders> findByUserIdAndDeliveryDate(int userId, LocalDate deliveryDate) {
        return orderRepository.findByUserIdAndDeliveryDate(userId, deliveryDate);
    }
}
