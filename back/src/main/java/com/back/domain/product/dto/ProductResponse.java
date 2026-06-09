package com.back.domain.product.dto;

import com.back.domain.product.entity.Product;

import java.time.LocalDateTime;

public record ProductResponse(
        int id,
        String name,
        String imageUrl,
        int price,
        int inventory,
        String description,
        LocalDateTime createDate,
        LocalDateTime modifyDate
) {
    public ProductResponse(Product product) {
        this(
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice(),
                product.getInventory(),
                product.getDescription(),
                product.getCreateDate(),
                product.getModifyDate()
        );
    }
}
