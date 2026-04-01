package com.biketrading.backend.entity;

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

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    // --- TIỀN BẠC & THANH TOÁN ---
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private Boolean depositPaid = false;
    private String paymentMethod; // CARD hoặc BANK_TRANSFER
    private String paymentPlan;   // DEPOSIT hoặc FULL

    // --- ĐỊA CHỈ GIAO HÀNG ---
    private String shippingStreet;
    private String shippingCity;
    private String shippingPostalCode;

    // --- TRACKING THỜI GIAN LUỒNG KHO ---
    private LocalDateTime shippedAt;              // Lúc Seller gửi xe
    private LocalDateTime warehouseConfirmedAt;   // Lúc Kho (Admin) nhận xe
    private LocalDateTime reInspectionDoneAt;     // Lúc Inspector kiểm định xong

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}