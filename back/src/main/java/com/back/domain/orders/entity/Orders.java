package com.back.domain.orders.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor
public class Orders {
    // 주문번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // 고객번호
    @ManyToOne(fetch = FetchType.LAZY)
    private Users usersId;

    // 생성날짜
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    // 수정날짜
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime modifyDate;

    // 주문현황 (기본 : false())
    @Column(nullable = false)
    private Boolean state;
}
