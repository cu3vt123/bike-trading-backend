package com.bob.planb.controller;

import com.bob.planb.entity.CertificationStatus;
import com.bob.planb.entity.InspectionResult;
import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.repository.ListingRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
public class AdminListingController {

    private final ListingRepository listingRepository;
    private final int LISTING_DURATION_DAYS = 30;

    // 1. Lấy danh sách tất cả các xe (Dùng cho Dashboard Admin)
    @GetMapping
    public ResponseEntity<?> listListings() {
        List<Listing> listings = listingRepository.findAll();
        return ResponseEntity.ok(Map.of("data", listings));
    }

    // 2. Lấy danh sách xe đang chờ xử lý tại kho
    @GetMapping("/pending-warehouse-intake")
    public ResponseEntity<?> listWarehouseIntakePending() {
        List<ListingState> states = Arrays.asList(
                ListingState.AT_WAREHOUSE_PENDING_VERIFY,
                ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION
        );
        List<Listing> listings = listingRepository.findByStateInAndIsHiddenFalseOrderByUpdatedAtDesc(states);
        return ResponseEntity.ok(Map.of("data", listings));
    }

    // 3. Admin xác nhận đã nhận được chiếc xe thật gửi tới kho
    @PutMapping("/{id}/confirm-warehouse-intake")
    public ResponseEntity<?> confirmWarehouseIntake(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getState() != ListingState.AT_WAREHOUSE_PENDING_VERIFY) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tin không ở trạng thái chờ xác nhận xe tại kho."));
        }

        listing.setState(ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION);
        listingRepository.save(listing);
        return ResponseEntity.ok(Map.of("data", listing));
    }

    // DTO hứng dữ liệu duyệt xe tại kho
    @Data
    public static class ReInspectionRequest {
        private String action; // "approve" hoặc "need_update"
        private String reason;
    }

    // 4. Inspector/Admin kiểm tra xe thực tế tại kho (Khớp với ảnh đăng không)
    @PutMapping("/{id}/confirm-warehouse-re-inspection")
    public ResponseEntity<?> confirmWarehouseReInspection(@PathVariable Long id, @RequestBody(required = false) ReInspectionRequest request) {
        Listing listing = listingRepository.findById(id).orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getState() != ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tin không ở trạng thái chờ inspector xác nhận tại kho."));
        }

        if (request != null && "need_update".equals(request.getAction())) {
            listing.setState(ListingState.NEED_UPDATE);
            listing.setInspectionResult(InspectionResult.NEED_UPDATE);
            listing.setInspectionNeedUpdateReason(request.getReason() != null ? request.getReason() : "Yêu cầu cập nhật sau kiểm tra tại kho.");
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("data", listing));
        }

        // Approve (Hợp lệ) -> Chính thức Publish lên sàn với mác CERTIFIED
        LocalDateTime now = LocalDateTime.now();
        listing.setState(ListingState.PUBLISHED);
        listing.setCertificationStatus(CertificationStatus.CERTIFIED);
        listing.setWarehouseIntakeVerifiedAt(now);
        listing.setPublishedAt(now);
        listing.setListingExpiresAt(now.plusDays(LISTING_DURATION_DAYS));

        listingRepository.save(listing);
        return ResponseEntity.ok(Map.of("data", listing));
    }

    // 5. Ẩn tin đăng (Quyền Admin)
    @PutMapping("/{id}/hide")
    public ResponseEntity<?> hideListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.isHidden()) {
            listing.setHidden(true);
            listing.setHiddenAt(LocalDateTime.now());
            listingRepository.save(listing);
        }
        return ResponseEntity.ok(Map.of("data", listing));
    }

    // 6. Hiện lại tin đăng
    @PutMapping("/{id}/unhide")
    public ResponseEntity<?> unhideListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElseThrow(() -> new RuntimeException("Listing not found"));
        if (listing.isHidden()) {
            listing.setHidden(false);
            listing.setHiddenAt(null);
            listingRepository.save(listing);
        }
        return ResponseEntity.ok(Map.of("data", listing));
    }
}