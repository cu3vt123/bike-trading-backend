package com.biketrading.backend.service;

import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    // Tạo đơn hàng mới (SHOP-13)
    public Order createOrder(Order order) {
        order.setStatus("PENDING"); // Mặc định vừa tạo là Chờ thanh toán
        return orderRepository.save(order);
    }

    // Thanh toán cọc (SHOP-14)
    public Order payDeposit(Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus("DEPOSIT_PAID"); // Đổi trạng thái thành Đã cọc
            return orderRepository.save(order);
        }).orElse(null);
    }
}