package com.biketrading.backend.controller;

import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        Order order = new Order();
        order.setBikeId(orderDTO.getBikeId());
        order.setBuyerId(orderDTO.getBuyerId());
        // Fix lỗi Required type: BigDecimal, Provided: Double
        order.setAmount(BigDecimal.valueOf(orderDTO.getAmount()));
        order.setStatus("PENDING");
        return ResponseEntity.status(201).body(orderRepository.save(order));
    }
}