package com.back.domain.orders.controller;

import com.back.domain.orders.dto.OrderDto;
import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.entity.Orders;
import com.back.domain.orders.service.OrderService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "OrderController", description = "API 주문 컨트롤러")
public class OrderController {
    private final OrderService orderService;

    // 주문 다건 조회
    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "주문 다건 조회")
    public List<OrderDto> getOrders() {
        List<Orders> orders = orderService.findAll();

        return orders
                .stream()
                .map(OrderDto::new)
                .toList();
    }

    // 주문 단건 조회
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "주문 단건 조회")
    public OrderDto getOrders(@PathVariable int id) {
        Orders order = orderService.findById(id).get();

        return new OrderDto(order);
    }



    public record OrderCreateReqBody(
            int userId,
            @NotBlank
            String address,
            @NotBlank
            String addressDetail,
            @NotBlank
            String postcode,
            int totalPrice
    ) {
    }

    // 주문 등록
    @PostMapping
    @Transactional
    @Operation(summary = "주문 등록")
    public RsData<OrderDto> createOrder(
            @RequestBody @Valid OrderCreateReqBody req
    ) {
        Orders orders = orderService.create(req.userId, req.address, req.addressDetail, req.postcode, req.totalPrice);

        return new RsData<>(
                "201-1",
                "%d번 주문이 등록되었습니다.".formatted(orders.getId()),
                new OrderDto(orders)
        );
    }


    // 주문 삭제
    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "주문 삭제")
    public RsData<Void> deleteOrder(@PathVariable int id) {
        Orders orders = orderService.findById(id).get();

        orderService.delete(orders);

        return new RsData<>(
                  "200-1",
                "%d번 글이 삭제되었습니다.".formatted(id)
        );
    }

    public record OrderModifyReqBody(
            OrderStatus status,
            int totalPrice
    ) {
    }

    // 주문 수정
    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "주문 수정")
    public RsData<Void> modify(
            @PathVariable int id,
            @RequestBody @Valid OrderModifyReqBody req
    ) {
        Orders order = orderService.findById(id).get();

        orderService.modify(order, req.status, req.totalPrice);

        return new RsData<>(
                "200-1",
                "%d번 주문이 수정되었습니다.".formatted(order.getId())
        );
    }

}