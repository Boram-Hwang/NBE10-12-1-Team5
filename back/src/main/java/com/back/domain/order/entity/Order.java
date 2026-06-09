package com.back.domain.order.entity;

import com.back.domain.user.entity.User;
import com.back.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

import static com.back.domain.order.entity.OrderStatus.PENDING;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
public class Order extends BaseEntity {
    // 고객번호
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    public Order(User user, String address, String addressDetail, String postcode, int totalPrice, LocalDate deliveryDate) {
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

    public void deleteStatus(OrderStatus status) {
        this.status = status;
        this.softDelete();
    }

    public void modifyTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
    }
}
