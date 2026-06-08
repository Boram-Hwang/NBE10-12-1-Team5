package com.back.domain.orders.entity;

public enum OrderStatus {
    PENDING,     // 주문확인중
    PROCESSING,   // 처리 중
    SHIPPED,     // 발송완료
    DELIVERED,   // 배송완료
    CANCELED     // 취소
}