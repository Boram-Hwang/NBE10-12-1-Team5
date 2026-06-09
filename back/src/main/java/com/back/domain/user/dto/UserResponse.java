package com.back.domain.user.dto;

import com.back.domain.user.entity.User;

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
    public UserResponse(User user) {
        this(user.getId(), user.getEmail(), user.getAddress(),
                user.getAddressDetail(), user.getPostcode(),
                user.getCreateDate(), user.getModifyDate());
    }
}