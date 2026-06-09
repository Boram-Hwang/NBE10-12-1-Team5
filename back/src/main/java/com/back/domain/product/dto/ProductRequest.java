package com.back.domain.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ProductRequest {
    // 상품 추가 요청 Dto
    public record ProductAddReqBody(
            @NotBlank(message = "상품 이름을 입력해주세요.")
            String name,

            @NotBlank(message = "상품 이미지 URL을 입력해주세요.")
            String imageUrl,

            @NotBlank(message = "상품 설명을 입력해주세요.")
            String description,

            @Min(value = 0, message = "가격은 최소 0원 이상이어야 합니다.")
            int price,

            int inventory
    ) {
    }

    public record ProductModifyReqBody(
            @NotBlank(message = "상품 이름을 입력해주세요.")
            String name,

            @NotBlank(message = "상품 이미지 URL을 입력해주세요.")
            String imageUrl,

            @NotBlank(message = "상품 설명을 입력해주세요.")
            String description,

            @Min(value = 0, message = "가격은 최소 0원 이상이어야 합니다.")
            int price,

            int inventory
    ) {
    }

    public record ProductImageUrlModifyReqBody(
            @NotBlank(message = "상품 이미지 URL을 입력해주세요.")
            String imageUrl
    ) {
    }
}

