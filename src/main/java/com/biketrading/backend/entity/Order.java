package com.biketrading.backend.entity;

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

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    private String status = "PENDING"; // PENDING, RESERVED, IN_TRANSACTION, COMPLETED, CANCELLED
    private String plan = "DEPOSIT"; // DEPOSIT hoặc FULL

    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private Boolean depositPaid = false;

    // Địa chỉ giao hàng
    private String shippingStreet;
    private String shippingCity;
    private String shippingPostalCode;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}