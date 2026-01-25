package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Order;
import com.biketrading.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // API Tạo đơn hàng: POST /api/orders
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    // API Thanh toán: PUT /api/orders/{id}/pay
    @PutMapping("/{id}/pay")
    public ResponseEntity<Order> payDeposit(@PathVariable Long id) {
        Order paidOrder = orderService.payDeposit(id);
        if (paidOrder != null) {
            return ResponseEntity.ok(paidOrder);
        }
        return ResponseEntity.notFound().build();
    }
}