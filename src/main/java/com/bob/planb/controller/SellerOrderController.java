package com.bob.planb.controller;

import com.bob.planb.dto.UpdateOrderStatusRequest;
import com.bob.planb.entity.*;
import com.bob.planb.repository.ListingRepository;
import com.bob.planb.repository.OrderRepository;
import com.bob.planb.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Lấy danh sách xe đã bán được
    @GetMapping
    public ResponseEntity<?> getMySales() {
        User user = getCurrentUser();
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(Map.of("data", orders));
    }

    // Cập nhật trạng thái giao hàng
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSellerId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not your order"));
        }

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        order.setStatus(newStatus);
        orderRepository.save(order);

        // Nếu giao hàng thành công -> Chốt hạ chiếc xe sang trạng thái ĐÃ BÁN (SOLD)
        if (newStatus == OrderStatus.DELIVERED) {
            Listing listing = listingRepository.findById(order.getListingId()).orElse(null);
            if (listing != null) {
                listing.setState(ListingState.SOLD);
                listingRepository.save(listing);
            }
        }

        return ResponseEntity.ok(Map.of("data", order));
    }
}