package com.biketrading.backend.controller;

import com.biketrading.backend.dto.CreateOrderRequest;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ListingRepository listingRepository;
    @Autowired private UserRepository userRepository;

    // Hàm phụ trợ lấy thông tin User đang đăng nhập
    private User getCurrentBuyer() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        User buyer = getCurrentBuyer();
        Listing listing = listingRepository.findById(request.getListingId()).orElse(null);

        if (listing == null || listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe không tồn tại hoặc chưa được đăng bán"));
        }

        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);

        // Cập nhật trạng thái chốt đơn ban đầu
        order.setStatus(OrderStatus.RESERVED);
        order.setPaymentPlan(request.getPlan());
        order.setDepositPaid(true);

        // Lưu thông tin địa chỉ ship từ Frontend gửi lên
        if (request.getShippingAddress() != null) {
            order.setShippingStreet(request.getShippingAddress().getStreet());
            order.setShippingCity(request.getShippingAddress().getCity());
            order.setShippingPostalCode(request.getShippingAddress().getPostalCode());
        }

        orderRepository.save(order);

        // Khóa tin đăng lại không cho người khác mua trùng
        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);

        return ResponseEntity.ok(order);
    }
}