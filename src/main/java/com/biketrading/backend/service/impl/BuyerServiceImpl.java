package com.biketrading.backend.service.impl;

import com.biketrading.backend.dto.BikeDTO;
import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.service.BuyerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BuyerServiceImpl implements BuyerService {

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Map<String, Object> getBuyerProfile(String username) {
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);
        if (buyerOpt.isEmpty()) {
            throw new RuntimeException("Buyer not found");
        }

        Buyer buyer = buyerOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("buyerId", buyer.getBuyerId());
        profile.put("username", buyer.getUsername());
        profile.put("email", buyer.getEmail());
        profile.put("phone", buyer.getPhone());
        profile.put("address", buyer.getAddress());
        profile.put("createdAt", buyer.getCreatedAt());

        return profile;
    }

    @Override
    public List<OrderDTO> getMyOrders(String username) {
        List<Order> orders = orderRepository.findByBuyerUsername(username);

        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setBikeId(order.getBikeId());
            dto.setBuyerId(order.getBuyerId());
            dto.setAmount(order.getAmount());
            dto.setStatus(order.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<BikeDTO> getWishlist(String username) {
        return List.of();
    }

    @Override
    public boolean cancelOrder(Long orderId, String username) {
        // 1. Tìm thông tin người đang đăng nhập
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(username);

        // 2. Tìm đơn hàng
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (buyerOpt.isPresent() && orderOpt.isPresent()) {
            Buyer buyer = buyerOpt.get();
            Order order = orderOpt.get();

            // BẢO MẬT (Chống IDOR): Kiểm tra xem người đang đăng nhập có phải là chủ đơn hàng không
            if (!order.getBuyerId().equals(buyer.getBuyerId())) {
                return false; // Trả về false nếu không phải đơn của mình
            }

            // Đổi trạng thái sang hủy nếu đơn đang chờ xử lý
            if (order.getStatus().equals("PENDING")) {
                order.setStatus("CANCELLED");
                orderRepository.save(order);
                return true;
            }
        }
        return false;
    }
}