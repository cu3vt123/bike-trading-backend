package com.biketrading.backend.entity;

import com.biketrading.backend.enums.UserRole;
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

    @Column(unique = true, nullable = false)
    private String username;

    private String email;
    private String password;
    private String displayName;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}