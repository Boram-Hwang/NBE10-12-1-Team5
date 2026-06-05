package com.back.domain.orders.entity;

public enum OrderStatus {
    PENDING,     // 주문 접수
    PROCESSING,   // 준비 중
    SHIPPED,     // 배송 중
    DELIVERED,   // 배송 완료
    CANCELED     // 취소
}