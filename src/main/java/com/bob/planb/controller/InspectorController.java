package com.bob.planb.controller;

import com.bob.planb.dto.ApproveListingRequest;
import com.bob.planb.dto.NeedUpdateRequest;
import com.bob.planb.entity.CertificationStatus;
import com.bob.planb.entity.InspectionReport;
import com.bob.planb.entity.InspectionResult;
import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.repository.ListingRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspector")
@RequiredArgsConstructor
public class InspectorController {

    private final ListingRepository listingRepository;

    @GetMapping("/pending-listings")
    public ResponseEntity<?> pendingListings() {
        List<Listing> listings = listingRepository
                .findByStateAndIsHiddenFalseOrderByUpdatedAtDesc(ListingState.PENDING_INSPECTION);
        return ResponseEntity.ok(Map.of("content", listings));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return ResponseEntity.ok(Map.of("data", listing));
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody(required = false) ApproveListingRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            return ResponseEntity.badRequest().body(Map.of("message", "Listing is not pending inspection"));
        }

        listing.setInspectionResult(InspectionResult.APPROVE);

        // Lưu báo cáo điểm số nếu có
        if (request != null && request.getInspectionReport() != null) {
            var reportDto = request.getInspectionReport();
            InspectionReport report = new InspectionReport();

            if (reportDto.getFrameIntegrity() != null) {
                report.setFrameIntegrityScore(reportDto.getFrameIntegrity().getScore());
                report.setFrameIntegrityLabel(reportDto.getFrameIntegrity().getLabel());
            }
            if (reportDto.getDrivetrainHealth() != null) {
                report.setDrivetrainHealthScore(reportDto.getDrivetrainHealth().getScore());
                report.setDrivetrainHealthLabel(reportDto.getDrivetrainHealth().getLabel());
            }
            if (reportDto.getBrakingSystem() != null) {
                report.setBrakingSystemScore(reportDto.getBrakingSystem().getScore());
                report.setBrakingSystemLabel(reportDto.getBrakingSystem().getLabel());
            }

            listing.setInspectionReport(report);

            // Tính điểm trung bình
            double avg = (report.getFrameIntegrityScore() + report.getDrivetrainHealthScore() + report.getBrakingSystemScore()) / 3.0;
            listing.setInspectionScore((double) Math.round(avg * 10) / 10);
        } else {
            listing.setInspectionScore(listing.getInspectionScore() != null ? listing.getInspectionScore() : 4.5);
        }

        // Vòng 1 xong: chờ seller gửi xe tới kho -> admin xác nhận (vòng 2) mới lên sàn CERTIFIED
        listing.setState(ListingState.AWAITING_WAREHOUSE);
        listing.setCertificationStatus(CertificationStatus.PENDING_WAREHOUSE);
        listing.setPublishedAt(null);
        listing.setListingExpiresAt(null);
        listing.setSellerShippedToWarehouseAt(null);
        listing.setWarehouseIntakeVerifiedAt(null);
        listing.setInspectionNeedUpdateReason("");

        listingRepository.save(listing);
        return ResponseEntity.ok(Map.of("data", listing));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            return ResponseEntity.badRequest().body(Map.of("message", "Listing is not pending inspection"));
        }

        listing.setInspectionResult(InspectionResult.REJECT);
        listing.setState(ListingState.REJECTED);
        listing.setInspectionNeedUpdateReason("");

        listingRepository.save(listing);
        return ResponseEntity.ok(Map.of("data", listing));
    }

    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<?> needUpdate(@PathVariable Long id, @Valid @RequestBody NeedUpdateRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            return ResponseEntity.badRequest().body(Map.of("message", "Listing is not pending inspection"));
        }

        listing.setInspectionResult(InspectionResult.NEED_UPDATE);
        listing.setState(ListingState.NEED_UPDATE);
        listing.setInspectionNeedUpdateReason(request.getReason());

        listingRepository.save(listing);
        return ResponseEntity.ok(Map.of("data", listing));
    }
}