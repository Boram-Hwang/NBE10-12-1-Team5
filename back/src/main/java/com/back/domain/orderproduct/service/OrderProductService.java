package com.back.domain.orderproduct.service;

import com.back.domain.orderproduct.dto.OrderProductRequest;
import com.back.domain.orderproduct.dto.OrderProductResponse;
import com.back.domain.orderproduct.entity.OrderProduct;
import com.back.domain.orderproduct.repository.OrderProductRepository;
import com.back.domain.order.entity.Order;
import com.back.domain.order.entity.OrderStatus;
import com.back.domain.order.repository.OrderRepository;
import com.back.domain.product.entity.Product;
import com.back.domain.notification.dto.NotificationResponse;
import com.back.domain.notification.dto.NotificationType;
import com.back.domain.notification.repository.SseEmitterRepository;
import com.back.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderProductService {

    private final OrderProductRepository orderProductRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SseEmitterRepository sseEmitterRepository;

    // 주문 생성시 내부 주문품목들 까지 한번에 처리하는 메서드
    @Transactional
    public void saveOrderProducts(int orderId, List<OrderProductRequest> requests) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        for (OrderProductRequest request : requests) {
            int productId = request.getProductId();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("존재하지 않는 상품입니다. 상품 ID: " + productId));

            if (product.getInventory() < request.getProductQuantity()) {
                throw new IllegalArgumentException("재고가 부족합니다. 상품명: " + product.getName()
                        + " (남은 재고: " + product.getInventory() + "개)");
            }

            int Inventory = product.getInventory() - request.getProductQuantity();
            product.modifyInventory(Inventory);
            
            OrderProduct orderProduct = OrderProduct.builder()
                    .order(order)
                    .product(product)
                    .productQuantity(request.getProductQuantity())
                    .productName(product.getName())
                    .productPrice(product.getPrice())
                    .build();

            orderProductRepository.save(orderProduct);
        }

        List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(orderId);
        int totalPrice = orderProducts.stream()
                .mapToInt(product -> product.getProductPrice() * product.getProductQuantity())
                .sum();

        order.modifyTotalPrice(totalPrice);
    }

    // 주문품목 다건 조회용 메서드
    public List<OrderProductResponse> getOrderProducts(int orderId) {
        List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(orderId);
        return orderProducts.stream()
                .map(OrderProductResponse::new)
                .toList();
    }

    // 주문품목 단건 조회용 메서드
    public OrderProductResponse getOrderProduct(int id) {
        OrderProduct orderProduct = orderProductRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문품목입니다. 주문품목 ID: " + id));
        return new OrderProductResponse(orderProduct);
    }

    // 주문 삭제시 주문에 포함된 주문품목들을 삭제하는 메서드
    @Transactional
    public void deleteOrderProducts(int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        if (order.getStatus() == OrderStatus.PENDING) {
            restoreInventory(orderId);
        }

        orderProductRepository.deleteByOrderId(orderId);
    }

    // 주문의 주문품목들을 수정하는 메서드
    @Transactional
    public void updateOrderProducts(int orderId, List<OrderProductRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new NoSuchElementException("주문품목이 비어있는 상태입니다.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("주문 접수중이 아닌 주문의 품목은 수정할 수 없습니다. 주문 ID: " + orderId);
        }

        deleteOrderProducts(orderId);
        saveOrderProducts(orderId, requests);

        // 실시간 주문 변경(주문품목 수정) 알림 발송
        NotificationResponse sseResponse = NotificationResponse.builder()
                .type(NotificationType.UPDATE_ORDER)
                .message("주문이 수정되었습니다.")
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .build();

        sseEmitterRepository.sendNotification(sseResponse);
    }


    // 주문 취소 및 삭제 시 상품들의 재고를 복구하는 메서드
    @Transactional
    public void restoreInventory(int orderId) {
        List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(orderId);

        for (OrderProduct orderProduct : orderProducts) {
            Product product = orderProduct.getProduct();
            int restoredInventory = product.getInventory() + orderProduct.getProductQuantity();
            product.modifyInventory(restoredInventory);
        }
    }


    // 추후 통계에 사용가능한 메서드
    public List<OrderProduct> findAll() {
        return orderProductRepository.findAll();
    }

    // 추후 통계에 사용가능한 메서드
    public long count() {
        return orderProductRepository.count();
    }
}
