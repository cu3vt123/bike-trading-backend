package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
@Transactional // 🔥 Bùa chú quan trọng nhất để chống sập Database (Lazy Load) 🔥
public class SellerController {

    @Autowired private ListingRepository listingRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentSeller() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    // ==========================================
    // 1. DASHBOARD & THỐNG KÊ
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        User seller = getCurrentSeller();

        List<Listing> listings = listingRepository.findAll().stream()
                .filter(l -> l.getSeller().getId().equals(seller.getId()))
                .collect(Collectors.toList());

        Map<String, Object> stats = Map.of(
                "total", listings.size(),
                "published", listings.stream().filter(l -> l.getState() == ListingState.PUBLISHED).count(),
                "inReview", listings.stream().filter(l -> l.getState() == ListingState.PENDING_INSPECTION).count(),
                "needUpdate", 0
        );

        // Chuyển toàn bộ Entity sang DTO để Frontend dễ đọc
        List<ListingDTO> listingDTOs = listings.stream()
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "stats", stats,
                "listings", listingDTOs
        ));
    }

    // ==========================================
    // 2. QUẢN LÝ XE ĐĂNG BÁN
    // ==========================================
    @GetMapping("/listings")
    public ResponseEntity<?> getListings() {
        User seller = getCurrentSeller();
        List<ListingDTO> listingDTOs = listingRepository.findAll().stream()
                .filter(l -> l.getSeller().getId().equals(seller.getId()))
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(listingDTOs);
    }

    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody Listing listing) {
        User seller = getCurrentSeller();

        if (seller.getRemainingListings() <= 0) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn đã hết lượt đăng tin. Vui lòng mua thêm gói cước!"));
        }

        if (seller.getPackageExpiryDate() != null && LocalDateTime.now().isAfter(seller.getPackageExpiryDate())) {
            seller.setRemainingListings(0);
            userRepository.save(seller);
            return ResponseEntity.status(403).body(Map.of("message", "Gói đăng tin của bạn đã hết hạn. Vui lòng mua gói mới!"));
        }

        seller.setRemainingListings(seller.getRemainingListings() - 1);
        userRepository.save(seller);

        listing.setSeller(seller);
        listing.setState(ListingState.DRAFT);
        listing.setIsVerified(false);
        Listing savedListing = listingRepository.save(listing);

        return ResponseEntity.ok(ListingDTO.fromEntity(savedListing));
    }

    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<?> submitListing(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setState(ListingState.PENDING_INSPECTION);
            listingRepository.save(listing);
            return ResponseEntity.ok(ListingDTO.fromEntity(listing));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }

    // ==========================================
    // 3. QUẢN LÝ ĐƠN HÀNG CỦA SELLER
    // ==========================================

    // 🔥 Hàm phụ trợ: Bẻ gãy vòng lặp vô tận của JSON 🔥
    private Map<String, Object> mapOrderToSafeMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("status", order.getStatus());
        map.put("totalPrice", order.getTotalPrice());
        map.put("paymentPlan", order.getPaymentPlan());
        map.put("depositPaid", order.getDepositPaid());
        map.put("createdAt", order.getCreatedAt());

        if (order.getBuyer() != null) {
            map.put("buyer", Map.of(
                    "id", order.getBuyer().getId(),
                    "username", order.getBuyer().getUsername()
            ));
        }
        if (order.getListing() != null) {
            map.put("listing", ListingDTO.fromEntity(order.getListing()));
        }
        return map;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        User seller = getCurrentSeller();
        List<Map<String, Object>> orders = orderRepository.findAll().stream()
                .filter(o -> o.getListing() != null && o.getListing().getSeller().getId().equals(seller.getId()))
                .map(this::mapOrderToSafeMap) // Dùng hàm bẻ gãy vòng lặp ở trên
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{orderId}/ship-to-warehouse")
    public ResponseEntity<?> shipToWarehouse(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (order.getStatus() == OrderStatus.RESERVED || order.getStatus() == OrderStatus.PENDING_SELLER_SHIP) {
            order.setStatus(OrderStatus.SELLER_SHIPPED);
            order.setShippedAt(LocalDateTime.now());
            orderRepository.save(order);
            return ResponseEntity.ok(mapOrderToSafeMap(order));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái đơn hàng không hợp lệ."));
    }
}