package com.back.domain.orderproduct.entity;

import com.back.domain.order.entity.Order;
import com.back.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "order_product")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class OrderProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int productQuantity;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private int productPrice;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    @Builder
    public OrderProduct(Order order, Product product, int productQuantity, String productName, int productPrice) {
        this.order = order;
        this.product = product;
        this.productQuantity = productQuantity;
        this.productName = productName;
        this.productPrice = productPrice;
    }

    public void updateQuantity(int productQuantity) {
        this.productQuantity = productQuantity;
    }
}
