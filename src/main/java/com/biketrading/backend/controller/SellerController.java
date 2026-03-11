package com.biketrading.backend.controller;

import com.biketrading.backend.dto.BikeDTO;
import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import com.biketrading.backend.service.BikeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private BikeService bikeService;

    @Autowired
    private SellerRepository sellerRepository;

    // ==========================================
    // 1. LẤY THỐNG KÊ DASHBOARD
    // ==========================================
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy thống kê doanh thu cho Seller")
    public ResponseEntity<?> getShopStats() {
        String sellerName = SecurityContextHolder.getContext().getAuthentication().getName();
        // Tạm thời mock dữ liệu (Sau này có thể viết query trong OrderRepository để tính toán thật)
        return ResponseEntity.ok(Map.of(
                "sellerName", sellerName,
                "totalOrders", 15,
                "totalRevenue", new BigDecimal("55000000"),
                "activeListings", 8
        ));
    }

    // ==========================================
    // 2. LẤY DANH SÁCH XE CỦA SHOP
    // ==========================================
    @GetMapping("/listings")
    @Operation(summary = "Lấy toàn bộ danh sách xe do Seller này đăng")
    public ResponseEntity<List<Bike>> getMyListings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Seller seller = sellerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

        // Gọi bikeService (đã có sẵn hàm getAllBikes theo sellerId)
        List<Bike> bikes = bikeService.getAllBikes(seller.getSellerId());

        return ResponseEntity.ok(bikes);
    }

    // ==========================================
    // 3. ĐĂNG BÁN XE (TẠO BẢN NHÁP - DRAFT)
    // ==========================================
    @PostMapping("/listings")
    @Operation(summary = "Seller đăng bán xe mới (Tạo bản nháp)")
    public ResponseEntity<?> createListing(@Valid @RequestBody BikeDTO bikeDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm thông tin Seller từ DB dựa vào token (username)
        Seller seller = sellerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

        // Gọi Service để tạo bản nháp (DRAFT)
        Bike createdBike = bikeService.createDraftBike(bikeDTO, seller.getSellerId());

        return ResponseEntity.status(201).body(Map.of(
                "message", "Tạo bản nháp thành công!",
                "bike", createdBike
        ));
    }

    // ==========================================
    // 4. GỬI YÊU CẦU KIỂM DUYỆT (SUBMIT)
    // ==========================================
    @PutMapping("/listings/{id}/submit")
    @Operation(summary = "Seller gửi yêu cầu kiểm duyệt xe lên hệ thống")
    public ResponseEntity<?> submitForInspection(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Seller seller = sellerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

        // Gọi Service để chuyển trạng thái sang PENDING_INSPECTION
        Bike bike = bikeService.submitForInspection(id, seller.getSellerId());

        return ResponseEntity.ok(Map.of(
                "message", "Đã gửi yêu cầu kiểm duyệt thành công!",
                "bike", bike
        ));
    }
}