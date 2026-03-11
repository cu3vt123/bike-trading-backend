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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {

    @Autowired
    private ListingRepository listingRepository;

    // ==========================================
    // 1. LẤY DANH SÁCH XE CHỜ DUYỆT
    // ==========================================
    @GetMapping("/pending-listings")
    public ResponseEntity<List<ListingDTO>> getPendingListings() {
        // Tìm xe có trạng thái PENDING_INSPECTION
        List<Listing> pendingBikes = listingRepository.findAll().stream()
                .filter(b -> b.getState() == ListingState.PENDING_INSPECTION)
                .toList();

        // Ép sang DTO trả về cho FE chuẩn form
        List<ListingDTO> response = pendingBikes.stream()
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. DUYỆT XE (Cho phép đăng lên sàn)
    // ==========================================
    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approveBike(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setInspectionResult(InspectionResult.APPROVE);
            listing.setState(ListingState.PUBLISHED); // Duyệt xong -> Cho lên sàn
            listing.setInspectionScore(5.0); // Chấm điểm 5 sao giả lập
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("message", "Đã duyệt xe thành công!"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }

    // ==========================================
    // 3. TỪ CHỐI XE (Đánh rớt)
    // ==========================================
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

    // ==========================================
    // 4. YÊU CẦU NGƯỜI BÁN CẬP NHẬT LẠI THÔNG TIN
    // ==========================================
    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<?> needUpdateBike(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();

            // Lấy lý do FE gửi lên, nếu không có thì dùng lý do mặc định
            String reason = requestBody.getOrDefault("reason", "Thông tin chưa đạt yêu cầu, vui lòng bổ sung ảnh hoặc mô tả.");

            listing.setInspectionResult(InspectionResult.NEED_UPDATE);
            listing.setState(ListingState.NEED_UPDATE);
            listingRepository.save(listing);

            return ResponseEntity.ok(Map.of(
                    "message", "Đã gửi yêu cầu cập nhật cho người bán",
                    "reason", reason
            ));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }
}