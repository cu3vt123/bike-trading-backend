package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ApiResponse;
import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bikes")
@RequiredArgsConstructor
public class BikeController {

    private final ListingRepository listingRepository;

    @GetMapping
    public Object getPublicBikes() {
        List<ListingDTO> data = listingRepository
                .findByStateAndInspectionResultAndIsHiddenFalseOrderByIdDesc(
                        ListingState.PUBLISHED,
                        InspectionResult.APPROVE
                )
                .stream()
                .map(ListingDTO::fromEntity)
                .toList();

        return data;
    }

    @GetMapping("/{id}")
    public ApiResponse<ListingDTO> getBikeDetail(@PathVariable Long id) {
        return listingRepository.findById(id)
                .filter(l -> !Boolean.TRUE.equals(l.getIsHidden()))
                .map(ListingDTO::fromEntity)
                .map(ApiResponse::of)
                .orElseThrow(() -> new RuntimeException("Bike not found"));
    }
}