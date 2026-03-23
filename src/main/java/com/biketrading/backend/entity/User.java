package com.biketrading.backend.entity;

import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore // Ẩn mật khẩu khi trả về API
    @Column(nullable = false)
    private String password;

    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // --- QUẢN LÝ GÓI CƯỚC (SUBSCRIPTION) ---
    @Enumerated(EnumType.STRING)
    private SubscriptionPlan currentPlan = SubscriptionPlan.FREE;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int remainingListings = 0;

    // 🔥 ĐÃ THÊM LẠI: Số lượt gọi Inspector kiểm định 🔥
    @Column(nullable = false, columnDefinition = "int default 0")
    private int inspectionCredits = 0;

    // 🔥 ĐÃ THÊM LẠI: Ngày hết hạn gói cước (1 tuần) 🔥
    private LocalDateTime packageExpiryDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}