package com.biketrading.backend.service.impl; // PHẢI LÀ PACKAGE SERVICE.IMPL

import com.biketrading.backend.dto.BikeDTO;
import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.service.BuyerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BuyerServiceImpl implements BuyerService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    public List<OrderDTO> getMyOrders(String username) {
        // Gọi hàm Native Query anh đã sửa trong OrderRepository
        List<Order> orders = orderRepository.findByBuyerUsername(username);
        return orders.stream()
                .map(o -> modelMapper.map(o, OrderDTO.class))
                .collect(Collectors.toList());
    }

    @Override public List<BikeDTO> getWishlist(String username) { return new ArrayList<>(); }
    @Override public boolean cancelOrder(Long id, String user) { return true; }
    @Override public Map<String, Object> getBuyerProfile(String u) { return Map.of("city", "Vũng Tàu"); }
}