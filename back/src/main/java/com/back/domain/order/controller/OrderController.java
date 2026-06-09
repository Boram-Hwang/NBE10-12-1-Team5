package com.back.domain.order.controller;

import com.back.domain.order.dto.OrderRequest;
import com.back.domain.order.dto.OrderResponse;
import com.back.domain.order.entity.Order;
import com.back.domain.order.service.OrderService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
@Tag(name = "OrderController", description = "API 주문 컨트롤러")
public class OrderController {
    private final OrderService orderService;

    // 주문 다건 조회
    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "주문 다건 조회")
    public List<OrderResponse> getOrder() {
        List<Order> orders = orderService.findAll();

        return orders
                .stream()
                .map(OrderResponse::new)
                .toList();
    }

    // 주문 단건 조회
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "주문 단건 조회")
    public OrderResponse getOrder(@PathVariable int id) {
        Order order = orderService.findById(id);

        return new OrderResponse(order);
    }

    // 배송일 기준 조회 (관리자)
    @GetMapping("/delivery")
    @Transactional(readOnly = true)
    @Operation(summary = "배송일 기준 조회")
    public List<OrderResponse> getOrdersDelivery(
            @RequestParam int userId,
            @RequestParam LocalDate deliveryDate
    ) {
        List<Order> orders = orderService.findByUserIdAndDeliveryDate(userId, deliveryDate);

        return orders
                .stream()
                .map(OrderResponse::new)
                .toList();
    }



    // 주문 등록
    @PostMapping
    @Transactional
    @Operation(summary = "주문 등록")
    public RsData<OrderResponse> createOrder(
            @RequestBody @Valid OrderRequest.OrderBasicRequest req
    ) {
        Order order = orderService.create(req.userId(), req.address(), req.addressDetail(), req.postcode(), req.totalPrice(), req.orderProducts());

        return new RsData<>(
                "201-1",
                "%d번 주문이 등록되었습니다.".formatted(order.getId()),
                new OrderResponse(order)
        );
    }


    // 주문 삭제
    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "주문 삭제")
    public RsData<Void> deleteOrder(@PathVariable int id) {
        orderService.delete(id);

        return new RsData<>(
                  "200-1",
                "%d번 주문이 삭제되었습니다.".formatted(id)
        );
    }




    // 주문 수정
    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "주문 수정")
    public RsData<Void> modify(
            @PathVariable int id,
            @RequestBody @Valid OrderRequest.OrderModifyRequest req
    ) {
        orderService.modify(id, req.status());

        return new RsData<>(
                "200-1",
                "%d번 주문이 수정되었습니다.".formatted(id)
        );
    }

}