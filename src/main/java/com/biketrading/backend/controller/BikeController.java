package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    @Autowired
    private ListingRepository listingRepository;

    @GetMapping
    public ResponseEntity<List<ListingDTO>> getPublicBikes() {
        // Chỉ lấy xe đã PUBLISHED và được APPROVE
        List<Listing> bikes = listingRepository.findByStateAndInspectionResult(
                ListingState.PUBLISHED,
                InspectionResult.APPROVE
        );

        // Chuyển sang DTO để FE đọc được
        List<ListingDTO> response = bikes.stream()
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBikeDetail(@PathVariable Long id) {
        return listingRepository.findById(id)
                .map(ListingDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }
}