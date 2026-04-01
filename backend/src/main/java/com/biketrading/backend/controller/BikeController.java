package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {
    private final ListingRepository listingRepository;

    public BikeController(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<?> items = listingRepository.findByStateAndIsHiddenFalse(ListingState.PUBLISHED).stream()
                .filter(l -> l.getListingExpiresAt() == null || l.getListingExpiresAt().isAfter(LocalDateTime.now()))
                .map(MapperUtil::listingDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(java.util.Map.of("content", items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }
}
