package com.back.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank(message = "주소를 입력해주세요.")
        String address,

        @NotBlank(message = "상세주소를 입력해주세요.")
        String addressDetail,

        @NotBlank(message = "우편번호를 입력해주세요.")
        String postcode
) {}