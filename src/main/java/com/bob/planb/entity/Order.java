package com.bob.planb.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @Column(nullable = false)
    private Long buyerId;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = false)
    private Long listingId;

    @Column(nullable = false)
    private String listingTitle;

    @Column(nullable = false)
    private Double amount; // Tổng giá trị xe

    // --- CÁC TRƯỜNG MỚI ĐỂ KHỚP VỚI FRONTEND ---
    @Column(nullable = false)
    private String plan; // "DEPOSIT" hoặc "FULL"

    private Double depositAmount; // Số tiền đã cọc

    @Builder.Default
    private Boolean balancePaid = false; // Đã thanh toán phần còn lại chưa?

    @Builder.Default
    private String vnpayPaymentStatus = "PENDING_PAYMENT"; // Trạng thái thanh toán VNPay

    private String fulfillmentType; // "WAREHOUSE" (Qua kho) hoặc "DIRECT" (Giao trực tiếp)

    @Builder.Default
    private Boolean acceptedUnverifiedDisclaimer = false;
    // -------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.VNPAY; // Mặc định là VNPay theo luồng mới

    // Lưu địa chỉ giao hàng dưới dạng String (VD: "123 Đường A, TP.HCM")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String shippingAddress;

    private String transactionNo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}