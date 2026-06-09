package com.back.domain.items.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ItemsRequest {
    // 상품 추가 요청 Dto
    public record ItemAddReqBody(
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

    public record ItemModifyReqBody(
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

    public record ItemImageUrlModifyReqBody(
            @NotBlank(message = "상품 이미지 URL을 입력해주세요.")
            String imageUrl
    ) {
    }
}

