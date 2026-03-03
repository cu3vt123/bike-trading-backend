package com.biketrading.backend.controller;

import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.OrderRepository;
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
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private BikeRepository bikeRepository; // Bổ sung BikeRepository

    @PostMapping
    @Operation(summary = "Buyer tạo đơn mua xe mới")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        // 1. Lấy username của Buyer đang đăng nhập từ JWT
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm thông tin Buyer trong DB
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Người dùng không tồn tại hoặc chưa đăng nhập!"));
        }

        // 3. Kiểm tra xe có tồn tại không
        Optional<Bike> bikeOpt = bikeRepository.findById(orderDTO.getBikeId());
        if (bikeOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chiếc xe này không tồn tại!"));
        }

        Bike bike = bikeOpt.get();
        Buyer buyer = buyerOpt.get();

        // 4. Tạo đơn hàng mới
        Order order = new Order();
        order.setBikeId(bike.getBikeId());
        order.setBuyerId(buyer.getBuyerId()); // Lấy đúng ID của người đang đăng nhập

        // BẢO MẬT: Lấy giá gốc của xe từ Database, phớt lờ amount do Client gửi lên
        order.setAmount(bike.getPrice());

        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        // 5. Lưu vào cơ sở dữ liệu
        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.status(201).body(Map.of(
                "message", "Đặt mua xe thành công!",
                "order", savedOrder
        ));
    }
}