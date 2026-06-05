package com.back.domain.orders.entity;

import com.back.domain.users.entity.Users;
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

    // 주소
    @Column(nullable = false)
    private String address;

    // 상세주소
    @Column(nullable = false)
    private String addressDetail;

    // 우편번호
    @Column(nullable = false)
    private String postcode;

    // 주문현황 (기본 : false())
    @Column(nullable = false)
    private Boolean state;

    // 총가격
    @Column(nullable = false)
    private int totalPrice;

    // 생성날짜
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    // 수정날짜
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime modifyDate;

    public Orders(String address, String addressDetail, String postcode) {
        this.address = address;
        this.addressDetail = addressDetail;
        this.postcode = postcode;
    }
}
