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

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private OrderFulfillmentType fulfillmentType;

    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private Boolean depositPaid = false;

    private String paymentMethod; // VNPAY_SANDBOX
    private String paymentPlan;   // DEPOSIT hoặc FULL

    private String vnpayTxnRef;
    private String vnpayPaymentStatus; // PENDING_PAYMENT, PAID, FAILED
    private Long vnpayAmountVnd;

    private String shippingStreet;
    private String shippingCity;
    private String shippingPostalCode;

    private LocalDateTime shippedAt;
    private LocalDateTime warehouseConfirmedAt;
    private LocalDateTime reInspectionDoneAt;
    private LocalDateTime expiresAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (depositPaid == null) {
            depositPaid = false;
        }
        if (vnpayPaymentStatus == null || vnpayPaymentStatus.isBlank()) {
            vnpayPaymentStatus = "PENDING_PAYMENT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}