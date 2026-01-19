package com.biketrading.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
@Data
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sellerId;

    private String username;
    private String password; // Lưu ý: Thực tế sẽ ẩn cái này đi, nhưng tạm thời cứ để để test
    private String email;
    private String phone;
    private String shopName;
    private Double reputationScore;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}