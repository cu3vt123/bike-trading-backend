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
import com.biketrading.backend.enums.OrderFulfillmentType;
import java.util.LinkedHashMap;

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
        Map<String, Object> map = new LinkedHashMap<>();

        map.put("id", String.valueOf(order.getId()));
        map.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        map.put("fulfillmentType",
                order.getFulfillmentType() != null ? order.getFulfillmentType().name() : null);
        map.put("totalPrice", order.getTotalPrice());
        map.put("plan", order.getPaymentPlan());
        map.put("depositAmount", order.getDepositAmount());
        map.put("depositPaid", order.getDepositPaid());
        map.put("vnpayPaymentStatus", order.getVnpayPaymentStatus());
        map.put("vnpayAmountVnd", order.getVnpayAmountVnd());
        map.put("paymentMethod", order.getPaymentMethod());
        map.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        map.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);
        map.put("shippedAt", order.getShippedAt() != null ? order.getShippedAt().toString() : null);
        map.put("expiresAt", order.getExpiresAt() != null ? order.getExpiresAt().toString() : null);

        Map<String, Object> shipping = new LinkedHashMap<>();
        shipping.put("street", order.getShippingStreet());
        shipping.put("city", order.getShippingCity());
        shipping.put("postalCode", order.getShippingPostalCode());
        map.put("shippingAddress", shipping);

        if (order.getBuyer() != null) {
            map.put("buyer", Map.of(
                    "id", String.valueOf(order.getBuyer().getId()),
                    "username", order.getBuyer().getUsername()
            ));
        }

        if (order.getListing() != null) {
            map.put("listing", ListingDTO.fromEntity(order.getListing()));
            map.put("listingId", String.valueOf(order.getListing().getId()));
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

    @GetMapping("/ratings")
    public ResponseEntity<?> getRatings() {
        return ResponseEntity.ok(Map.of(
                "averageRating", 0,
                "totalReviews", 0,
                "positivePercent", 0,
                "breakdown", Map.of(
                        "1", 0,
                        "2", 0,
                        "3", 0,
                        "4", 0,
                        "5", 0
                )
        ));
    }

    @PutMapping("/orders/{orderId}/ship-to-buyer")
    public ResponseEntity<?> shipToBuyer(@PathVariable Long orderId) {
        User seller = getCurrentSeller();

        Order order = orderRepository.findById(orderId).orElseThrow();

        if (order.getListing() == null
                || order.getListing().getSeller() == null
                || !order.getListing().getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền xử lý đơn này"));
        }

        if (order.getFulfillmentType() != OrderFulfillmentType.DIRECT) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ đơn DIRECT mới giao thẳng cho buyer"));
        }

        if (order.getStatus() != OrderStatus.PENDING_SELLER_SHIP) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái đơn hàng không hợp lệ"));
        }

        order.setStatus(OrderStatus.SHIPPING);
        order.setShippedAt(LocalDateTime.now());
        order.setExpiresAt(LocalDateTime.now().plusHours(24));
        orderRepository.save(order);

        return ResponseEntity.ok(mapOrderToSafeMap(order));
    }
}