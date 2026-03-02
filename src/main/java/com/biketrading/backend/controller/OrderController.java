package com.biketrading.backend.controller;

import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.OrderRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        Order order = new Order();
        order.setBikeId(orderDTO.getBikeId());
        order.setBuyerId(orderDTO.getBuyerId());

        // Gán trực tiếp vì OrderDTO đã là BigDecimal (Hết lỗi Required type: BigDecimal)
        order.setAmount(orderDTO.getAmount());

        order.setStatus("PENDING");
        return ResponseEntity.status(201).body(orderRepository.save(order));
    }
}