package com.biketrading.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy thống kê doanh thu cho Seller")
    public ResponseEntity<?> getShopStats() {
        String sellerName = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(Map.of(
                "sellerName", sellerName,
                "totalOrders", 15,
                "totalRevenue", new BigDecimal("55000000"),
                "activeListings", 8
        ));
    }
}