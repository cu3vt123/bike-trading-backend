package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
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

    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return ResponseEntity.ok(bike);
    }
    @Autowired
    private com.biketrading.backend.repository.BikeRepository bikeRepository; // Tạm gọi thẳng Repo cho nhanh

    // API: Xem danh sách tất cả xe
    // GET http://localhost:8080/api/bikes
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes() {
        return ResponseEntity.ok(bikeRepository.findAll());
    }
}