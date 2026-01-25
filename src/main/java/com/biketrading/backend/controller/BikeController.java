package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository; // Đã thêm import
import com.biketrading.backend.service.BikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    @Autowired
    private BikeRepository bikeRepository;

    // API 1: Xem chi tiết xe
    // GET http://localhost:8081/api/bikes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return ResponseEntity.ok(bike);
    }

    // API 2: Xem danh sách tất cả xe
    // GET http://localhost:8081/api/bikes
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes() {
        return ResponseEntity.ok(bikeRepository.findAll());
    }

    // API 3 (MỚI): Tìm kiếm xe theo tên (SHOP-12)
    // GET http://localhost:8081/api/bikes/search?keyword=Galaxy
    @GetMapping("/search")
    public ResponseEntity<List<Bike>> searchBikes(@RequestParam String keyword) {
        return ResponseEntity.ok(bikeRepository.findByNameContaining(keyword));
    }
}