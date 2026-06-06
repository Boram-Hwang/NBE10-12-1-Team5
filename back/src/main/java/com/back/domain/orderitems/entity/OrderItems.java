package com.back.domain.orderitems.entity;

import com.back.domain.items.entity.Items;
import com.back.domain.orders.entity.Orders;
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
@Table(name = "order_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class OrderItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Items item;

    @Column(nullable = false)
    private int itemQuantity;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private int itemPrice;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    @Builder
    public OrderItems(Orders order, Items item, int itemQuantity, String itemName, int itemPrice) {
        this.order = order;
        this.item = item;
        this.itemQuantity = itemQuantity;
        this.itemName = itemName;
        this.itemPrice = itemPrice;
    }

    public void updateQuantity(int itemQuantity) {
        this.itemQuantity = itemQuantity;
    }
}
