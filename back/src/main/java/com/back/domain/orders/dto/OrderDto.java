package com.back.domain.orders.dto;

import com.back.domain.orders.entity.Orders;
import com.back.domain.users.entity.Users;

import java.time.LocalDateTime;

public record OrderDto(
        int id,
        Users usersId,
        String address,
        String addressDetail,
        String postcode,
        boolean state,
        LocalDateTime createDate,
        LocalDateTime modifyDate
) {
    public OrderDto(Orders orders) {
        this(
                orders.getId(),
                orders.getUsersId(),
                orders.getAddress(),
                orders.getAddressDetail(),
                orders.getPostcode(),
                orders.getState(),
                orders.getCreateDate(),
                orders.getModifyDate()
        );
    }
}
