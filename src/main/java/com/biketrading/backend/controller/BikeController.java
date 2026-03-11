package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.service.BikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    @Autowired
    private BikeRepository bikeRepository;

    @Operation(summary = "Get bike listings", description = "Public endpoint. Returns bike listings. Optional filter by sellerId.")
    @GetMapping
    public ResponseEntity<?> getAllBikes(
            @Parameter(description = "Filter by seller id", example = "1") @RequestParam(required = false) Long sellerId
    ) {
        List<Bike> allBikes = bikeService.getAllBikes(sellerId);

        // BỘ LỌC BẢO VỆ SÀN: Chỉ cho phép hiển thị xe CÓ SẴN (AVAILABLE) và ĐÃ ĐƯỢC DUYỆT (APPROVED)
        List<Bike> filteredBikes = allBikes.stream()
                .filter(b -> "AVAILABLE".equals(b.getSalesStatus()) && "APPROVED".equals(b.getApprovalStatus()))
                .collect(Collectors.toList());

        // Trả về định dạng JSON { "content": [...] } để Frontend đọc được
        return ResponseEntity.ok(Map.of("content", filteredBikes));
    }

    @Operation(summary = "Get bike detail", description = "Public endpoint. Returns details of a bike listing by id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Bike not found", content = @Content())
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getBikeDetail(
            @Parameter(description = "Bike id", example = "1") @PathVariable Long id
    ) {
        Bike bike = bikeService.getBikeById(id);
        if (bike == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe!"));
        }
        return ResponseEntity.ok(bike);
    }

    @Operation(summary = "Search bikes by keyword", description = "Public endpoint. Search bikes by name (contains).")
    @GetMapping("/search")
    public ResponseEntity<?> searchBikes(
            @Parameter(description = "Keyword to search in bike name", example = "Giant") @RequestParam String keyword
    ) {
        List<Bike> searchedBikes = bikeRepository.findByNameContaining(keyword);

        // BỘ LỌC TÌM KIẾM: Chỉ tìm ra xe CÓ SẴN và ĐÃ DUYỆT
        List<Bike> filteredBikes = searchedBikes.stream()
                .filter(b -> "AVAILABLE".equals(b.getSalesStatus()) && "APPROVED".equals(b.getApprovalStatus()))
                .collect(Collectors.toList());

        // Trả về định dạng JSON { "content": [...] }
        return ResponseEntity.ok(Map.of("content", filteredBikes));
    }
}