package com.back.domain.items.entity;

import com.back.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Items extends BaseEntity {
    private String name;

    @Column(columnDefinition = "INT UNSIGNED")
    private int price;

    @Column(columnDefinition = "INT UNSIGNED")
    private int inventory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "IMAGE_URL", length = 1000)
    private String imageUrl;

    public Items(String name, String imageUrl, String description, int price, int inventory) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.inventory = inventory;
    }

    public void modify(String name, String imageUrl, String description, int price, int inventory) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.inventory = inventory;
    }

    public void modifyInventory(int inventory) {
        this.inventory = inventory;
    }

    public void modifyImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}
