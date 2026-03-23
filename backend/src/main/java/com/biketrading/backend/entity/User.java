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

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private Boolean isHidden = false;
    private LocalDateTime hiddenAt;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.FREE;

    private LocalDateTime subscriptionExpiresAt;

    @Column(nullable = false)
    private Integer publishedSlotsLimit = 0;

    @Column(nullable = false)
    private Integer inspectionCredits = 0;

    @Column(updatable = false)
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
