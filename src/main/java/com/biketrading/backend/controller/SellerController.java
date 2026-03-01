package com.biketrading.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/seller") // Đảm bảo đường dẫn là /api/seller, không được là /api/auth
public class SellerController {

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy thống kê doanh thu cho Seller")
    public ResponseEntity<?> getShopStats() {
        // Lấy tên người dùng hiện tại từ Token
        String sellerName = SecurityContextHolder.getContext().getAuthentication().getName();

        // Trả về dữ liệu mẫu (mock data) để test
        return ResponseEntity.ok(Map.of(
                "sellerName", sellerName,
                "totalOrders", 15,
                "totalRevenue", new BigDecimal("55000000"), // 55 triệu
                "activeListings", 8
        ));
    }
}