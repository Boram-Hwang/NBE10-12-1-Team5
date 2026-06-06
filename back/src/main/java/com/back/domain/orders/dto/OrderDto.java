package com.back.domain.orders.dto;

import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.entity.Orders;
import com.back.domain.users.entity.Users;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OrderDto(
        int id,
        int userId,
        String address,
        String addressDetail,
        String postcode,
        OrderStatus status,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        int totalPrice,
        LocalDate deliveryDate
) {
    public OrderDto(Orders orders) {
        this(
                orders.getId(),
                orders.getUser().getId(),
                orders.getAddress(),
                orders.getAddressDetail(),
                orders.getPostcode(),
                orders.getStatus(),
                orders.getCreateDate(),
                orders.getModifyDate(),
                orders.getTotalPrice(),
                orders.getDeliveryDate()
        );
    }
}
