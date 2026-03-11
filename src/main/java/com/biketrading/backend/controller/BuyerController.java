package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ListingRepository listingRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // 1. Tạo đơn đặt hàng mới
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> requestBody) {
        User buyer = getCurrentUser();
        Long listingId = requestBody.get("listingId");

        Listing listing = listingRepository.findById(listingId).orElse(null);
        if (listing == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
        }

        // Kiểm tra xem xe có đang PUBLISHED (mở bán) không
        if (listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.status(400).body(Map.of("message", "Xe này hiện không thể mua"));
        }

        // Tạo đơn hàng
        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setTotalPrice(listing.getPrice());
        order.setStatus("PENDING");

        // Đổi trạng thái xe thành Đang giao dịch
        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);

        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    // 2. Lấy danh sách đơn hàng của tôi
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders() {
        User buyer = getCurrentUser();
        if (buyer == null) return ResponseEntity.status(401).build();

        List<Order> myOrders = orderRepository.findByBuyerId(buyer.getId());
        return ResponseEntity.ok(myOrders);
    }
    // 3. Hoàn tất thanh toán đơn hàng
    @PutMapping("/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null || !order.getBuyer().getId().equals(buyer.getId())) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy đơn hàng của bạn"));
        }

        // Cập nhật trạng thái đơn hàng
        order.setStatus("COMPLETED");
        order.setDepositPaid(true); // Đã thanh toán
        orderRepository.save(order);

        // Cập nhật trạng thái xe thành ĐÃ BÁN
        Listing listing = order.getListing();
        listing.setState(ListingState.SOLD);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of("message", "Thanh toán thành công! Chúc mừng bạn đã sở hữu xe."));
    }

    // 4. Hủy đơn hàng
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null || !order.getBuyer().getId().equals(buyer.getId())) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy đơn hàng của bạn"));
        }

        if (order.getStatus().equals("COMPLETED") || order.getStatus().equals("CANCELLED")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng này không thể hủy nữa"));
        }

        // Hủy đơn
        order.setStatus("CANCELLED");
        orderRepository.save(order);

        // Nhả xe lại lên sàn (Trả về trạng thái PUBLISHED)
        Listing listing = order.getListing();
        listing.setState(ListingState.PUBLISHED);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng thành công!"));
    }
}