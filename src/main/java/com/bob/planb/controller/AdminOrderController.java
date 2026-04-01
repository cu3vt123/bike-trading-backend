package com.bob.planb.controller;

import com.bob.planb.dto.UpdateOrderStatusRequest;
import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.entity.Order;
import com.bob.planb.entity.OrderStatus;
import com.bob.planb.repository.ListingRepository;
import com.bob.planb.repository.OrderRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;

    // Xem toàn bộ đơn hàng trên hệ thống
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(Map.of("data", orders));
    }

    // Cập nhật trạng thái đơn (Dành cho Admin can thiệp)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        order.setStatus(newStatus);
        orderRepository.save(order);

        Listing listing = listingRepository.findById(order.getListingId()).orElse(null);

        // Xử lý đồng bộ trạng thái xe
        if (listing != null) {
            if (newStatus == OrderStatus.DELIVERED) {
                // Giao xong -> Đã bán
                listing.setState(ListingState.SOLD);
                listingRepository.save(listing);
            } else if (newStatus == OrderStatus.CANCELLED) {
                // Hủy đơn -> Trả xe lại về sàn để người khác có thể mua tiếp
                if (listing.getState() == ListingState.IN_TRANSACTION || listing.getState() == ListingState.RESERVED) {
                    listing.setState(ListingState.PUBLISHED);
                    listingRepository.save(listing);
                }
            }
        }

        return ResponseEntity.ok(Map.of("data", order));
    }
}