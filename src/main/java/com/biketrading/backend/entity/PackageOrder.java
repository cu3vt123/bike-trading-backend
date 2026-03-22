package com.biketrading.backend.entity;

import com.biketrading.backend.enums.PaymentStatus;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan plan; // Mua gói gì?

    private BigDecimal amount; // Tổng tiền

    // Mã giao dịch duy nhất gửi sang VNPay (Ví dụ: VNPAY_12345)
    @Column(unique = true)
    private String txnRef;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt; // Thời điểm ting ting

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}