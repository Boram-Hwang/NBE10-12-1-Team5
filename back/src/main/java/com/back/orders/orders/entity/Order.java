package com.back.orders.orders.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.apache.catalina.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor
public class Order {
    // 주문번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // 고객번호
    @ManyToOne(fetch = FetchType.LAZY)
    private User usersId;

    // 생성날짜
    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    // 수정날짜
    @Column(nullable = false)
    private LocalDateTime modifyDate;

    // 주문현황
    @Column(nullable = false)
    private Boolean state;
}
