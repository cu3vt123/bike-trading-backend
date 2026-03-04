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

    // TẠO ĐƠN HÀNG: Mua xong là KHÓA XE (RESERVED)
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

        // KIỂM TRA: Nếu xe không ở trạng thái AVAILABLE thì không cho mua
        if (!"AVAILABLE".equals(bike.getSalesStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rất tiếc, chiếc xe này đã có người đặt hoặc đã bán!"));
        }

        Buyer buyer = buyerOpt.get();

        Order order = new Order();
        order.setBikeId(bike.getBikeId());
        order.setBuyerId(buyer.getBuyerId());
        order.setAmount(bike.getPrice());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // KHÓA XE TẠM THỜI (Tránh người khác mua trùng)
        bike.setSalesStatus("RESERVED");
        bikeRepository.save(bike);

        return ResponseEntity.status(201).body(Map.of(
                "message", "Đặt mua xe thành công!",
                "order", savedOrder
        ));
    }

    // HOÀN TẤT: Thanh toán xong là ẨN XE VĨNH VIỄN (SOLD)
    @PostMapping("/orders/{orderId}/complete")
    @Operation(summary = "Buyer thanh toán và hoàn tất đơn hàng")
    public ResponseEntity<?> completeOrder(@PathVariable Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng không tồn tại!"));
        }

        Order order = orderOpt.get();
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);
        if (buyerOpt.isEmpty() || !order.getBuyerId().equals(buyerOpt.get().getBuyerId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền thao tác trên đơn hàng này!"));
        }

        // Đổi trạng thái đơn hàng -> COMPLETED
        order.setStatus("COMPLETED");
        orderRepository.save(order);

        // Đổi trạng thái xe -> ĐÃ BÁN (SOLD)
        Optional<Bike> bikeOpt = bikeRepository.findById(order.getBikeId());
        if (bikeOpt.isPresent()) {
            Bike bike = bikeOpt.get();
            bike.setSalesStatus("SOLD");
            bikeRepository.save(bike);
        }

        return ResponseEntity.ok(Map.of("message", "Thanh toán và hoàn tất đơn hàng thành công!"));
    }

    // HỦY ĐƠN: Nhả xe lại lên sàn (AVAILABLE)
    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);

        if (buyerOpt.isPresent() && orderOpt.isPresent()) {
            Buyer buyer = buyerOpt.get();
            Order order = orderOpt.get();

            if (!order.getBuyerId().equals(buyer.getBuyerId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền hủy đơn này."));
            }

            if (order.getStatus().equals("PENDING")) {
                order.setStatus("CANCELLED");
                orderRepository.save(order);

                // NHẢ XE LẠI SÀN (RESERVED -> AVAILABLE)
                Optional<Bike> bikeOpt = bikeRepository.findById(order.getBikeId());
                if (bikeOpt.isPresent()) {
                    Bike bike = bikeOpt.get();
                    bike.setSalesStatus("AVAILABLE");
                    bikeRepository.save(bike);
                }

                return ResponseEntity.ok(Map.of("message", "Hủy đơn hàng thành công!"));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng này."));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(buyerService.getWishlist(username));
    }
}