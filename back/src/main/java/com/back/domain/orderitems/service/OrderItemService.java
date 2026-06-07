package com.back.domain.orderitems.service;

import com.back.domain.orderitems.dto.OrderItemRequest;
import com.back.domain.orderitems.dto.OrderItemResponse;
import com.back.domain.orderitems.entity.OrderItems;
import com.back.domain.orderitems.repository.OrderItemRepository;
import com.back.domain.orders.entity.Orders;
import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.repository.OrderRepository;
import com.back.domain.items.entity.Items;
import com.back.domain.items.repository.ItemsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final ItemsRepository itemsRepository;
    private final OrderRepository orderRepository;

    // 주문 생성시 내부 주문품목들 까지 한번에 처리하는 메서드
    @Transactional
    public void saveOrderItems(int orderId, List<OrderItemRequest> requests) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        for (OrderItemRequest request : requests) {
            int itemId = request.getItemId();
            Items item = itemsRepository.findById(itemId)
                    .orElseThrow(() -> new NoSuchElementException("존재하지 않는 상품입니다. 상품 ID: " + itemId));

            if (item.getInventory() < request.getItemQuantity()) {
                throw new IllegalArgumentException("재고가 부족합니다. 상품명: " + item.getName()
                        + " (남은 재고: " + item.getInventory() + "개)");
            }

            // items 엔티티에 재고만 수정하는 메서드 구현 필요
            int Inventory = item.getInventory() - request.getItemQuantity();
            item.modify(item.getName(), item.getDescription(), item.getPrice(), Inventory);
            
            OrderItems orderItem = OrderItems.builder()
                    .order(order)
                    .item(item)
                    .itemQuantity(request.getItemQuantity())
                    .itemName(item.getName())
                    .itemPrice(item.getPrice())
                    .build();

            orderItemRepository.save(orderItem);
        }

        List<OrderItems> orderItems = orderItemRepository.findByOrderId(orderId);
        int totalPrice = orderItems.stream()
                .mapToInt(item -> item.getItemPrice() * item.getItemQuantity())
                .sum();

        order.modifyTotalPrice(totalPrice);
    }

    // 주문품목 다건 조회용 메서드
    public List<OrderItemResponse> getOrderItems(int orderId) {
        List<OrderItems> orderItems = orderItemRepository.findByOrderId(orderId);
        return orderItems.stream()
                .map(OrderItemResponse::new)
                .toList();
    }

    // 주문품목 단건 조회용 메서드
    public OrderItemResponse getOrderItem(int id) {
        OrderItems orderItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문품목입니다. 주문품목 ID: " + id));
        return new OrderItemResponse(orderItem);
    }

    // 주문 삭제시 주문에 포함된 주문품목들을 삭제하는 메서드
    @Transactional
    public void deleteOrderItems(int orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        if (order.getStatus() == OrderStatus.PENDING) {
            restoreInventory(orderId);
        }

        orderItemRepository.deleteByOrderId(orderId);
    }

    // 주문의 주문품목들을 수정하는 메서드
    @Transactional
    public void updateOrderItems(int orderId, List<OrderItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new NoSuchElementException("주문품목이 비어있는 상태입니다.");
        }

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 주문입니다. 주문 ID: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("주문 접수중이 아닌 주문의 품목은 수정할 수 없습니다. 주문 ID: " + orderId);
        }

        deleteOrderItems(orderId);
        saveOrderItems(orderId, requests);

    }


    // 주문 취소 및 삭제 시 상품들의 재고를 복구하는 메서드
    @Transactional
    public void restoreInventory(int orderId) {
        List<OrderItems> orderItems = orderItemRepository.findByOrderId(orderId);

        // items 엔티티에 재고만 수정하는 메서드 구현 필요
        for (OrderItems orderItem : orderItems) {
            Items item = orderItem.getItem();
            int restoredInventory = item.getInventory() + orderItem.getItemQuantity();
            item.modify(item.getName(), item.getDescription(), item.getPrice(), restoredInventory);
        }
    }


    // 추후 통계에 사용가능한 메서드
    public List<OrderItems> findAll() {
        return orderItemRepository.findAll();
    }

    // 추후 통계에 사용가능한 메서드
    public long count() {
        return orderItemRepository.count();
    }
}
