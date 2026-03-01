package com.biketrading.backend.service.impl;

import com.biketrading.backend.dto.*;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.service.BuyerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BuyerServiceImpl implements BuyerService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    public List<OrderDTO> getMyOrders(String username) {
        List<Order> orders = orderRepository.findByBuyerUsername(username);
        return orders.stream().map(o -> modelMapper.map(o, OrderDTO.class)).collect(Collectors.toList());
    }

    @Override public List<BikeDTO> getWishlist(String username) { return new ArrayList<>(); }

    @Override
    public Map<String, Object> getBuyerProfile(String username) {
        return Map.of("username", username, "fullName", "Nguyễn Anh Bảo", "city", "Vũng Tàu");
    }

    @Override // Bổ sung hàm này để hết báo lỗi Interface
    public boolean cancelOrder(Long orderId, String username) { return true; }
}