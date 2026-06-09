package com.back.domain.orderproduct.dto;

import com.back.domain.orderproduct.entity.OrderProduct;
import java.time.LocalDateTime;

public record OrderProductResponse(
        int id,
        int orderId,
        int productId,
        int productQuantity,
        String productName,
        int productPrice,
        LocalDateTime createDate
) {
    public OrderProductResponse(OrderProduct orderProduct) {
        this(
                orderProduct.getId(),
                orderProduct.getOrder().getId(),
                orderProduct.getProduct().getId(),
                orderProduct.getProductQuantity(),
                orderProduct.getProductName(),
                orderProduct.getProductPrice(),
                orderProduct.getCreateDate()
        );
    }
}
