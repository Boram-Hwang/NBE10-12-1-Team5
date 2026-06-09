package com.back.domain.orderproduct.controller;

import com.back.domain.orderproduct.dto.OrderProductRequest;
import com.back.domain.orderproduct.dto.OrderProductResponse;
import com.back.domain.orderproduct.service.OrderProductService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order/{orderId}/product")
@RequiredArgsConstructor
@Tag(name = "OrderProductController", description = "API 주문품목 컨트롤러")
public class OrderProductController {

    private final OrderProductService orderProductService;

    @GetMapping
    @Operation(summary = "주문품목 다건 조회")
    public RsData<List<OrderProductResponse>> getOrderProducts(@PathVariable int orderId) {
        List<OrderProductResponse> response = orderProductService.getOrderProducts(orderId);
        return new RsData<>("200-1", "주문 품목 리스트 조회 성공", response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "주문품목 단건 조회")
    public RsData<OrderProductResponse> getOrderProduct(@PathVariable int orderId, @PathVariable int id) {
        OrderProductResponse response = orderProductService.getOrderProduct(id);
        return new RsData<>("200-1", "주문 품목 단건 조회 성공", response);
    }

    @PostMapping
    @Operation(summary = "주문품목 생성")
    public RsData<Void> saveOrderProducts(
            @PathVariable int orderId,
            @RequestBody List<@Valid OrderProductRequest> requests) {
                
        orderProductService.saveOrderProducts(orderId, requests);
        return new RsData<>("200-1", "주문 품목 등록 성공");
    }

    @DeleteMapping
    @Operation(summary = "주문품목 전체 삭제")
    public RsData<Void> deleteOrderProducts(@PathVariable int orderId) {
        orderProductService.deleteOrderProducts(orderId);
        return new RsData<>("200-1", "주문 품목 일괄 삭제 성공");
    }

    @PutMapping
    @Operation(summary = "주문품목 수정")
    public RsData<Void> updateOrderProducts(
            @PathVariable int orderId,
            @RequestBody List<@Valid OrderProductRequest> requests) {
                
        orderProductService.updateOrderProducts(orderId, requests);
        
        return new RsData<>("200-1", "주문 품목 수정 성공");
    }
}
