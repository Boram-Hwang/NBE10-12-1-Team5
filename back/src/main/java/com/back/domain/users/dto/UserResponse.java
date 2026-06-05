package com.back.domain.users.dto;

import com.back.domain.users.entity.Users;

import java.time.LocalDateTime;

public record UserResponse(
        Integer id,
        String email,
        String address,
        String addressDetail,
        String postcode,
        LocalDateTime createDate,
        LocalDateTime modifyDate
) {
    public UserResponse(Users users) {
        this(users.getId(), users.getEmail(), users.getAddress(),
                users.getAddressDetail(), users.getPostcode(),
                users.getCreateDate(), users.getModifyDate());
    }
}