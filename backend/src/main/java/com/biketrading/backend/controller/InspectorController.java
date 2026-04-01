package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.CertificationStatus;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {
    private final ListingRepository listingRepository;

    public InspectorController(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    @GetMapping("/pending-listings")
    public ResponseEntity<?> pendingListings() {
        List<?> items = listingRepository.findByState(ListingState.PENDING_INSPECTION).stream().map(MapperUtil::listingDto).collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        listing.setInspectionResult(InspectionResult.APPROVE);
        listing.setInspectionScore(4.8);
        listing.setInspectionReportJson(body == null ? null : String.valueOf(body.get("inspectionReport")));
        listing.setState(ListingState.AWAITING_WAREHOUSE);
        listing.setCertificationStatus(CertificationStatus.PENDING_WAREHOUSE);
        listingRepository.save(listing);
        return ApiResponse.ok(Map.of("ok", true));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        listing.setInspectionResult(InspectionResult.REJECT);
        listing.setState(ListingState.REJECTED);
        listingRepository.save(listing);
        return ApiResponse.ok(Map.of("ok", true));
    }

    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<?> needUpdate(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        listing.setInspectionResult(InspectionResult.NEED_UPDATE);
        listing.setInspectionNeedUpdateReason(body == null ? "Need update" : String.valueOf(body.getOrDefault("reason", "Need update")));
        listing.setState(ListingState.NEED_UPDATE);
        listing.setCertificationStatus(CertificationStatus.UNVERIFIED);
        listingRepository.save(listing);
        return ApiResponse.ok(Map.of("ok", true));
    }
}
