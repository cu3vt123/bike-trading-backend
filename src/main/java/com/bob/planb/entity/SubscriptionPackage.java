package com.bob.planb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subscription_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;           // Ví dụ: "Gói Thành Viên Đồng", "Gói VIP"
    private Double price;          // Giá tiền (VNĐ)
    private Integer limitPost;     // Số tin đăng tối đa được phép
    private Integer durationDays;  // Thời hạn gói (ví dụ: 30 ngày)
}