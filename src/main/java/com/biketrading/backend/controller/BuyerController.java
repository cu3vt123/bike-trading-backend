package com.biketrading.backend.controller;

import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.service.BuyerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired private BuyerService buyerService;
    @Autowired private BuyerRepository buyerRepository;
    @Autowired private BikeRepository bikeRepository;
    @Autowired private OrderRepository orderRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(buyerService.getBuyerProfile(username));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(buyerService.getMyOrders(username));
    }

    // ĐÃ DI DỜI TỪ ORDER CONTROLLER SANG ĐÂY ĐỂ KHỚP URL FRONTEND
    @PostMapping("/orders")
    @Operation(summary = "Buyer tạo đơn mua xe mới")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Người dùng không tồn tại!"));
        }

        Optional<Bike> bikeOpt = bikeRepository.findById(orderDTO.getBikeId());
        if (bikeOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chiếc xe này không tồn tại!"));
        }

        Bike bike = bikeOpt.get();
        Buyer buyer = buyerOpt.get();

        Order order = new Order();
        order.setBikeId(bike.getBikeId());
        order.setBuyerId(buyer.getBuyerId());
        order.setAmount(bike.getPrice()); // Bảo mật: lấy giá gốc của hệ thống
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.status(201).body(Map.of(
                "message", "Đặt mua xe thành công!",
                "order", savedOrder
        ));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isCancelled = buyerService.cancelOrder(orderId, username);
        if (isCancelled) {
            return ResponseEntity.ok(Map.of("message", "Hủy đơn hàng thành công!"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng này."));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(buyerService.getWishlist(username));
    }
}