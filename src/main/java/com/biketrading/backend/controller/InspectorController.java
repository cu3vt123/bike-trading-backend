package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.service.BikeService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {

    @Autowired
    private BikeService bikeService;

    // ==========================================
    // 1. LẤY DANH SÁCH XE CHỜ DUYỆT
    // ==========================================
    @GetMapping("/pending-listings")
    @Operation(summary = "Lấy danh sách các xe đang chờ kiểm duyệt")
    public ResponseEntity<List<Bike>> getPendingListings() {
        // Hàm này sử dụng logic getPendingListings đã thêm vào BikeService ở bước trước
        List<Bike> pendingBikes = bikeService.getPendingListings();
        return ResponseEntity.ok(pendingBikes);
    }

    // ==========================================
    // 2. DUYỆT XE (APPROVE)
    // ==========================================
    @PutMapping("/listings/{id}/approve")
    @Operation(summary = "Duyệt xe và cho phép hiển thị lên sàn (AVAILABLE)")
    public ResponseEntity<?> approveBike(@PathVariable Long id) {
        Bike bike = bikeService.inspectBike(id, "APPROVE");
        return ResponseEntity.ok(Map.of(
                "message", "Đã duyệt xe thành công!",
                "bike", bike
        ));
    }

    // ==========================================
    // 3. TỪ CHỐI XE (REJECT)
    // ==========================================
    @PutMapping("/listings/{id}/reject")
    @Operation(summary = "Từ chối xe")
    public ResponseEntity<?> rejectBike(@PathVariable Long id) {
        Bike bike = bikeService.inspectBike(id, "REJECT");
        return ResponseEntity.ok(Map.of(
                "message", "Đã từ chối xe này!",
                "bike", bike
        ));
    }
}