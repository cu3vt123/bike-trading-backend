package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired private ListingRepository listingRepository;
    @Autowired private OrderRepository orderRepository;

    // 1. Gửi xe nháp lên hệ thống chờ duyệt
    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody Listing listing) {
        listing.setState(ListingState.DRAFT);
        Listing savedListing = listingRepository.save(listing);
        return ResponseEntity.ok(savedListing);
    }

    // 2. Yêu cầu kiểm định để đăng sàn
    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<?> submitListing(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setState(ListingState.PENDING_INSPECTION);
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("message", "Đã gửi xe đi kiểm định thành công"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }

    // 3. SELLER GỬI XE ĐẾN KHO CỦA NỀN TẢNG (Luồng Shipping)
    @PutMapping("/orders/{orderId}/ship-to-warehouse")
    public ResponseEntity<?> shipToWarehouse(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        if (order.getStatus() == OrderStatus.RESERVED || order.getStatus() == OrderStatus.PENDING_SELLER_SHIP) {
            order.setStatus(OrderStatus.SELLER_SHIPPED);
            order.setShippedAt(LocalDateTime.now());
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật: Seller đã gửi xe đến kho."));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái đơn hàng không hợp lệ để gửi xe."));
    }
}