package com.biketrading.backend.entity;

import com.biketrading.backend.enums.OrderFulfillmentType;
import com.biketrading.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.RESERVED;

    @Enumerated(EnumType.STRING)
    private OrderFulfillmentType fulfillmentType = OrderFulfillmentType.DIRECT;

    private String plan;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private Boolean depositPaid = false;
    private Boolean balancePaid = false;
    private String vnpayPaymentStatus;
    private BigDecimal vnpayAmountVnd;

    private String shippingStreet;
    private String shippingCity;
    private String shippingPostalCode;

    private LocalDateTime shippedAt;
    private LocalDateTime warehouseConfirmedAt;
    private LocalDateTime reInspectionDoneAt;
    private LocalDateTime expiresAt;
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
