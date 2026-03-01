package com.biketrading.backend.service;

import com.biketrading.backend.dto.*;
import java.util.*;

public interface BuyerService {
    Map<String, Object> getBuyerProfile(String username);
    List<OrderDTO> getMyOrders(String username);
    List<BikeDTO> getWishlist(String username);
    boolean cancelOrder(Long orderId, String username); // Thêm hàm này để fix lỗi hình {348C3A7A-72C1-4207-9567-764D510007E0}.png
}