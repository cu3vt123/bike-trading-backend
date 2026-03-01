package com.biketrading.backend.controller;

import com.biketrading.backend.service.BuyerService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired
    private BuyerService buyerService;

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

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(buyerService.getWishlist(username)); // SẼ HẾT ĐỎ
    }
}