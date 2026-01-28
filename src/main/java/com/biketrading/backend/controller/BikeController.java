package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
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
    private BikeRepository bikeRepository; // Phải có dòng này mới tìm kiếm được

    // SHOP-15: Xem chi tiết xe
    // GET http://localhost:8081/api/bikes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return ResponseEntity.ok(bike);
    }

    // SHOP-12: Xem danh sách xe (Có thể lọc theo người bán)
    // GET http://localhost:8081/api/bikes
    // GET http://localhost:8081/api/bikes?sellerId=1
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes(@RequestParam(required = false) Long sellerId) {
        return ResponseEntity.ok(bikeService.getAllBikes(sellerId));
    }

    // SHOP-12 (MỞ RỘNG): Tìm kiếm xe theo tên
    // GET http://localhost:8081/api/bikes/search?keyword=Galaxy
    @GetMapping("/search")
    public ResponseEntity<List<Bike>> searchBikes(@RequestParam String keyword) {
        return ResponseEntity.ok(bikeRepository.findByNameContaining(keyword));
    }
} // Ngoặc đóng class phải nằm ở tận cùng thế này mới đúng