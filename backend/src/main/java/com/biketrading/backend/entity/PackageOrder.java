package com.biketrading.backend.entity;

import com.biketrading.backend.enums.PackageOrderStatus;
import com.biketrading.backend.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "package_orders")
@Data
public class PackageOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan plan;

    private String provider;
    private BigDecimal amountVnd;
    private String paymentUrl;

    @Enumerated(EnumType.STRING)
    private PackageOrderStatus status = PackageOrderStatus.PENDING;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
