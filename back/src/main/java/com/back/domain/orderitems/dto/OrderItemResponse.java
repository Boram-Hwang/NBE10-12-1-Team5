package com.back.domain.orderitems.dto;

import com.back.domain.orderitems.entity.OrderItems;
import java.time.LocalDateTime;

public record OrderItemResponse(
        int id,
        int orderId,
        int itemId,
        int itemQuantity,
        String itemName,
        int itemPrice,
        LocalDateTime createDate
) {
    public OrderItemResponse(OrderItems orderItems) {
        this(
                orderItems.getId(),
                orderItems.getOrder().getId(),
                orderItems.getItem().getId(),
                orderItems.getItemQuantity(),
                orderItems.getItemName(),
                orderItems.getItemPrice(),
                orderItems.getCreateDate()
        );
    }
}
