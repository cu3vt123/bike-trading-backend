package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.service.BikeService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    private final BikeService bikeService;

    public BikeController(BikeService bikeService) {
        this.bikeService = bikeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBikes() {
        List<Map<String, Object>> items = bikeService.listBikes();
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched bikes", Map.of("content", items)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBike(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched bike", bikeService.getBikeById(id)));
    }
}
