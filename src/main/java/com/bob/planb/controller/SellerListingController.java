package com.bob.planb.controller;

import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.entity.User;
import com.bob.planb.repository.ListingRepository;
import com.bob.planb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/listings")
@RequiredArgsConstructor
public class SellerListingController {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    // Hàm lấy User đang đăng nhập dựa trên Token
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    @PostMapping
    public ResponseEntity<?> createListing(@RequestBody Listing listing) {
        User seller = getCurrentUser();

        // 1. KIỂM TRA HẠN MỨC GÓI (Dứt điểm lỗi PACKAGE_REQUIRED)
        if (seller.getUsedPost() >= seller.getTotalPostAllowed()) {
            return ResponseEntity.status(403).body(Map.of(
                    "message", "PACKAGE_REQUIRED",
                    "details", "Bạn đã dùng hết lượt đăng tin. Vui lòng mua thêm gói hội viên."
            ));
        }

        // 2. THIẾT LẬP THÔNG TIN XE
        listing.setSeller(seller); // Hết lỗi đỏ vì cả 2 đều là kiểu User
        listing.setState(ListingState.DRAFT); // Mới tạo luôn là bản nháp

        // 3. LƯU VÀO DATABASE
        Listing savedListing = listingRepository.save(listing);

        // 4. CẬP NHẬT SỐ LƯỢNG TIN ĐÃ DÙNG CỦA SELLER
        seller.setUsedPost(seller.getUsedPost() + 1);
        userRepository.save(seller);

        return ResponseEntity.ok(Map.of(
                "message", "Đăng tin nháp thành công!",
                "data", savedListing,
                "postsRemaining", (seller.getTotalPostAllowed() - seller.getUsedPost())
        ));
    }

    // API lấy danh sách xe của riêng tôi (Seller)
    @GetMapping("/my")
    public ResponseEntity<?> getMyListings() {
        User seller = getCurrentUser();
        return ResponseEntity.ok(listingRepository.findBySeller(seller));
    }
}