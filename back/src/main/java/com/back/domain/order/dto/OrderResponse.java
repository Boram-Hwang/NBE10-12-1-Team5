package com.back.domain.order.dto;

import com.back.domain.order.entity.OrderStatus;
import com.back.domain.order.entity.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OrderResponse(
        int id,
        int userId,
        String address,
        String addressDetail,
        String postcode,
        OrderStatus status,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        int totalPrice,
        LocalDate deliveryDate,
        LocalDateTime deleteDate
) {
    public OrderResponse(Order order) {
        this(
                order.getId(),
                order.getUser().getId(),
                order.getAddress(),
                order.getAddressDetail(),
                order.getPostcode(),
                order.getStatus(),
                order.getCreateDate(),
                order.getModifyDate(),
                order.getTotalPrice(),
                order.getDeliveryDate(),
                order.getDeleteDate()
        );
    }
}
