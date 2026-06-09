package com.back.domain.orderproduct.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderProductRequest {

    @NotNull(message = "상품번호는 필수입니다.")
    private Integer productId;

    @NotNull(message = "주문수량은 필수입니다.")
    @Min(value = 1, message = "주문 수량은 최소 1개 이상이어야 합니다.")
    private Integer productQuantity;
}
