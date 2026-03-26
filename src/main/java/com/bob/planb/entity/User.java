package com.bob.planb.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    // Đã thêm displayName để fix lỗi đỏ ở BuyerOrderController
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Dùng @Builder.Default để trị dứt điểm cảnh báo vàng của Lombok
    @Builder.Default
    private Integer totalPostAllowed = 0;

    @Builder.Default
    private Integer usedPost = 0;

    @Builder.Default
    private boolean isHidden = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    public String getDisplayName() {
        return this.displayName;
    }
}