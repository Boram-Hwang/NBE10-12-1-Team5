package com.back.domain.orders.dto;

import com.back.domain.orderitems.dto.OrderItemRequest;
import com.back.domain.orders.entity.OrderStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public class OrderRequest {
        public record OrderBasicRequest(
                int userId,

                @NotBlank(message = "주소를 입력해주세요.")
                String address,

                @NotBlank(message = "상세주소를 입력해주세요.")
                String addressDetail,

                @NotBlank(message = "우편번호를 입력해주세요.")
                String postcode,

                OrderStatus status,
                int totalPrice,

                LocalDate deliveryDate,

                List<OrderItemRequest> orderItems

        ) {}

        public record OrderModifyRequest(
                OrderStatus status
        ) {}
}