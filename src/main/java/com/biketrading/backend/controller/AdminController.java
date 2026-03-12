package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;

    // 1. Xem danh sách User
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "message", "Xin chào Admin!",
                "totalUsers", users.size(),
                "users", users
        ));
    }

    // 2. ADMIN XÁC NHẬN KHO ĐÃ NHẬN ĐƯỢC XE TỪ SELLER
    @PutMapping("/orders/{orderId}/warehouse-receive")
    public ResponseEntity<?> warehouseReceive(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
        order.setWarehouseConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Kho đã nhận được xe, chờ Inspector kiểm tra lại."));
    }

    // 3. ADMIN BẮT ĐẦU SHIP XE TỪ KHO ĐẾN BUYER
    @PutMapping("/orders/{orderId}/start-shipping")
    public ResponseEntity<?> startShippingToBuyer(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        // Chỉ cho phép ship đi khi Inspector đã kiểm định xong tại kho
        if (order.getStatus() == OrderStatus.RE_INSPECTION_DONE) {
            order.setStatus(OrderStatus.SHIPPING);
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("message", "Bắt đầu giao xe đến tận nhà cho người mua!"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: Xe chưa được Inspector kiểm định lại tại kho!"));
    }
}