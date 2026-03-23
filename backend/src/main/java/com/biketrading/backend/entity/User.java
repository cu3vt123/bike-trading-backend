package com.biketrading.backend.entity;

import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false)
    private Boolean isHidden = false;

    private LocalDateTime hiddenAt;

    @Column(length = 120)
    private String resetPasswordToken;

    private LocalDateTime resetPasswordExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SubscriptionPlan subscriptionPlan;

    private LocalDateTime subscriptionExpiresAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}