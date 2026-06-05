package com.back.domain.orders.dto;

import com.back.orders.orders.entity.Order;
import org.apache.catalina.User;

import java.time.LocalDateTime;

public record OrderDto(
        int id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        User userId,
        boolean state
) {
    public OrderDto(Order order) {
        this(
                order.getId(),
                order.getCreateDate(),
                order.getModifyDate(),
                order.getUsersId(),
                order.getState()
        );
    }
}
