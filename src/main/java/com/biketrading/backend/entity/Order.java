package com.biketrading.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "bike_id")
    private Long bikeId;

    @Column(name = "buyer_id")
    private Long buyerId;

    @Column(name = "total_amount") // <--- QUAN TRỌNG: Sửa lỗi 500 ở đây
    private BigDecimal amount;

    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ==========================================
    // GETTER VÀ SETTER
    // ==========================================
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getBikeId() { return bikeId; }
    public void setBikeId(Long bikeId) { this.bikeId = bikeId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}