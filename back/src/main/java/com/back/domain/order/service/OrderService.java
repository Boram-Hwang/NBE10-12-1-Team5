package com.back.domain.order.service;

import com.back.domain.notification.dto.NotificationResponse;
import com.back.domain.notification.dto.NotificationType;
import com.back.domain.notification.repository.SseEmitterRepository;
import com.back.domain.orderproduct.dto.OrderProductRequest;
import com.back.domain.order.entity.OrderStatus;
import com.back.domain.order.entity.Order;
import com.back.domain.order.repository.OrderRepository;
import com.back.domain.orderproduct.service.OrderProductService;
import com.back.domain.user.entity.User;
import com.back.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final OrderProductService orderProductService;
    private final SseEmitterRepository sseEmitterRepository;

    public long count() { return orderRepository.count(); }

    // 주문 다건 조회
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(int id) {
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
    public Order create(int usersId, String address, String addressDetail, String postcode, int totalPrice, List<OrderProductRequest> orderProductReq) {

        LocalDate deliveryDate = calculateDeliveryDate();

        // User 번호 받아와서 등록
        User userId = userService.findById(usersId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객입니다."));

        Order order = new Order(
                userId,
                address,
                addressDetail,
                postcode,
                totalPrice,
                deliveryDate
        );

        // 주문 저장
        Order saveOrder = orderRepository.save(order);
        orderProductService.saveOrderProducts(saveOrder.getId(), orderProductReq);

        NotificationResponse sseResponse = NotificationResponse.builder()
                .type(NotificationType.CREATE_ORDER)
                .message("새로운 주문이 접수되었습니다.")
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .build();

        sseEmitterRepository.sendNotification(sseResponse);

        return saveOrder;
    }

    // 주문 삭제
    public void delete(int id) {
        // 서비스에서 처리하는 게 좋음
        Order order = orderRepository.findById(id).orElseThrow(() -> new NoSuchElementException(
                "%d번 주문이 없습니다.".formatted(id)
        ));

        orderProductService.deleteOrderProducts(order.getId());
        orderRepository.delete(order);
    }

    // 주문 수정
    public void modify(Order order, OrderStatus status) {
        // 주문 상태 값이 없을 경우
        if(status == null) {
            throw new IllegalArgumentException("주문 상태는 필수입니다.");
        }

        OrderStatus currentStatus = order.getStatus();

        // 주문 상태가 이미 CANCELED일 경우 중복 처리
        // 이미 취소된 주문은 어떠상태로도 수정 불가 처리
        if(currentStatus == OrderStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }

        // PENDING 상태인 주문만 취소 가능할 경우 예외 처리
        if(status == OrderStatus.CANCELED && currentStatus != OrderStatus.PENDING) {
            throw new IllegalStateException("대기 중인 주문만 취소할 수 있습니다.");
        }

        // 주문취소일 경우 재고 처리
        if(status == OrderStatus.CANCELED) {
            orderProductService.restoreInventory(order.getId());
        }
        order.modifyStatus(status);
    }

    public List<Order> findByUserIdAndDeliveryDate(int userId, LocalDate deliveryDate) {
        if(deliveryDate == null) {
            throw new IllegalArgumentException("배송일은 필수입니다.");
        }

        // 고객의 배송주문 건이 없을 경우
        List<Order> orders = orderRepository.findByUserIdAndDeliveryDate(userId, deliveryDate);

        if(orders.isEmpty()) {
            throw new NoSuchElementException(
                    "%d번 고객의 %s 배송 주문이 없습니다.".formatted(userId, deliveryDate)
            );
        }

        return orders;
    }
}
