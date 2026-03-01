package com.biketrading.backend.controller;

import com.biketrading.backend.dto.BikeDTO;
import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.service.BikeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    @Autowired
    private BikeRepository bikeRepository;

    // SHOP-15: Xem chi tiết xe
    // GET http://localhost:8081/api/bikes/{id}
    @Operation(
            summary = "Get bike detail",
            description = "Public endpoint. Returns details of a bike listing by id."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Bike not found", content = @Content())
    })
    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(
            @Parameter(description = "Bike id", example = "1")
            @PathVariable Long id
    ) {
        Bike bike = bikeService.getBikeById(id);
        if (bike == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bike);
    }

    // SHOP-12: Xem danh sách xe (Có thể lọc theo người bán)
    // GET http://localhost:8081/api/bikes
    // GET http://localhost:8081/api/bikes?sellerId=1
    @Operation(
            summary = "Get bike listings",
            description = "Public endpoint. Returns bike listings. Optional filter by sellerId."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "400", description = "Invalid query parameter")
    })
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes(
            @Parameter(description = "Filter by seller id", example = "1")
            @RequestParam(required = false) Long sellerId
    ) {
        return ResponseEntity.ok(bikeService.getAllBikes(sellerId));
    }

    // SHOP-12 (MỞ RỘNG): Tìm kiếm xe theo tên
    // GET http://localhost:8081/api/bikes/search?keyword=Galaxy
    @Operation(
            summary = "Search bikes by keyword",
            description = "Public endpoint. Search bikes by name (contains)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "400", description = "Missing/invalid keyword")
    })
    @GetMapping("/search")
    public ResponseEntity<List<Bike>> searchBikes(
            @Parameter(description = "Keyword to search in bike name", example = "Giant")
            @RequestParam String keyword
    ) {
        return ResponseEntity.ok(bikeRepository.findByNameContaining(keyword));
    }
    @PostMapping
    @Operation(summary = "Seller đăng bán xe mới")
    public ResponseEntity<?> createListing(@Valid @RequestBody BikeDTO bikeDTO) {
        // Lấy username của Seller hiện tại từ Token (đã qua lớp Security lọc)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentSeller = auth.getName();

        // Logic: Gọi service để lưu xe vào DB và gắn ID của Seller này vào
        // bikeService.saveBike(bikeDTO, currentSeller);

        return ResponseEntity.status(201).body(Map.of(
                "message", "Đăng xe thành công!",
                "seller", currentSeller,
                "bikeName", bikeDTO.getName()
        ));
    }
}