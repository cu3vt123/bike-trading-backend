package com.bob.planb.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerInfo {
    private Long sellerId; // Lưu ID thay vì reference cứng để tránh lỗi xóa user
    private String sellerName;
    private String sellerEmail;
}