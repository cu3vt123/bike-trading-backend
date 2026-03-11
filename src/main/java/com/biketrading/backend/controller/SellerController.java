package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired private ListingRepository listingRepository;
    @Autowired private UserRepository userRepository;

    // Lấy user đang đăng nhập
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // 1. Lấy danh sách xe CỦA NGƯỜI BÁN NÀY
    @GetMapping("/listings")
    public ResponseEntity<List<ListingDTO>> getMyListings() {
        User seller = getCurrentUser();
        if (seller == null) return ResponseEntity.status(401).build();

        // Tạm thời lấy tất cả xe của seller này (Lọc thủ công, bạn có thể viết thêm hàm trong Repository sau)
        List<Listing> myListings = listingRepository.findAll().stream()
                .filter(l -> l.getSeller() != null && l.getSeller().getId().equals(seller.getId()))
                .collect(Collectors.toList());

        List<ListingDTO> response = myListings.stream()
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 2. Tạo tin đăng xe mới (Mặc định là DRAFT)
    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody Listing request) {
        User seller = getCurrentUser();
        if (seller == null) return ResponseEntity.status(401).build();

        request.setSeller(seller);
        request.setState(ListingState.DRAFT); // Vừa tạo thì trạng thái là Nháp

        Listing savedListing = listingRepository.save(request);
        return ResponseEntity.ok(ListingDTO.fromEntity(savedListing));
    }

    // 3. Gửi xe đi kiểm định
    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<?> submitForInspection(@PathVariable Long id) {
        User seller = getCurrentUser();
        Listing listing = listingRepository.findById(id).orElse(null);

        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe của bạn"));
        }

        listing.setState(ListingState.PENDING_INSPECTION); // Chuyển trạng thái sang chờ duyệt
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of("message", "Đã gửi xe đi kiểm định thành công"));
    }
}