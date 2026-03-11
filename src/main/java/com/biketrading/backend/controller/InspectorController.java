package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {

    @Autowired
    private ListingRepository listingRepository;

    // 1. Lấy danh sách xe đang chờ duyệt
    @GetMapping("/pending-listings")
    public ResponseEntity<?> getPendingListings() {
        // Tìm xe có trạng thái PENDING_INSPECTION
        List<Listing> pendingBikes = listingRepository.findAll().stream()
                .filter(b -> b.getState() == ListingState.PENDING_INSPECTION)
                .toList();
        return ResponseEntity.ok(pendingBikes);
    }

    // 2. Duyệt xe (Chuyển thành PUBLISHED)
    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approveBike(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setInspectionResult(InspectionResult.APPROVE);
            listing.setState(ListingState.PUBLISHED); // Duyệt xong là đăng lên sàn
            listing.setInspectionScore(5.0); // Chấm điểm giả lập
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("message", "Đã duyệt xe thành công!"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }

    // 3. Từ chối xe
    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<?> rejectBike(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setInspectionResult(InspectionResult.REJECT);
            listing.setState(ListingState.REJECTED);
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối xe"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }
    // 4. Yêu cầu Seller cập nhật lại thông tin xe
    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<?> needUpdateBike(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();

            // Lấy lý do từ body do Frontend gửi lên
            String reason = requestBody.getOrDefault("reason", "Thông tin chưa đạt yêu cầu, vui lòng bổ sung.");

            listing.setInspectionResult(InspectionResult.NEED_UPDATE);
            listing.setState(ListingState.NEED_UPDATE);

            // Lưu lý do vào entity (Bạn có thể thêm trường inspectionNeedUpdateReason vào file Listing.java nếu muốn lưu)
            // Tạm thời trả về JSON cho Frontend biết
            listingRepository.save(listing);

            return ResponseEntity.ok(Map.of(
                    "message", "Đã gửi yêu cầu cập nhật cho người bán",
                    "reason", reason
            ));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }
}