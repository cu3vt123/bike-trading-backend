package com.bob.planb.controller;

import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bikes")
@RequiredArgsConstructor
public class PublicBikeController {

    private final ListingRepository listingRepository;

    @GetMapping
    public ResponseEntity<?> listBikes() {
        // Đã đổi sang gọi hàm findAvailableBikes ngắn gọn và an toàn hơn
        List<Listing> listings = listingRepository.findAvailableBikes(ListingState.PUBLISHED, LocalDateTime.now());

        return ResponseEntity.ok(Map.of("content", listings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBike(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);

        if (listing == null || listing.isHidden() || listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }

        if (listing.getListingExpiresAt() != null && listing.getListingExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }

        return ResponseEntity.ok(Map.of("data", listing));
    }
}