package com.back.domain.items.dto;

import com.back.domain.items.entity.Items;

import java.time.LocalDateTime;

public record ItemsDto(
        int id,
        String name,
        int price,
        int inventory,
        String description,
        LocalDateTime createDate,
        LocalDateTime modifyDate
) {
    public ItemsDto(Items items) {
        this(
                items.getId(),
                items.getName(),
                items.getPrice(),
                items.getInventory(),
                items.getDescription(),
                items.getCreateDate(),
                items.getModifyDate()
        );
    }
}
