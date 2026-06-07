package com.back.domain.orders.entity;

import com.back.domain.users.entity.Users;
import com.back.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.back.domain.orders.entity.OrderStatus.PENDING;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
public class Orders extends BaseEntity {
    // 고객번호
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    // 주소
    @Column(nullable = false)
    private String address;

    // 상세주소
    @Column
    private String addressDetail;

    // 우편번호
    @Column(nullable = false)
    private String postcode;

    // 주문현황 (기본 : PENDING)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // 총가격
    @Column(nullable = false)
    private int totalPrice;

    // 배송일
    @Column(nullable = false)
    private LocalDate deliveryDate;

    public Orders(Users user, String address, String addressDetail, String postcode, int totalPrice, LocalDate deliveryDate) {
        this.user = user;
        this.address = address;
        this.addressDetail = addressDetail;
        this.postcode = postcode;
        this.status = PENDING;
        this.totalPrice = totalPrice;
        this.deliveryDate = deliveryDate;
    }

    public void modifyStatus(OrderStatus status) {
        this.status = status;
    }

    public void modifyTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
    }
}
