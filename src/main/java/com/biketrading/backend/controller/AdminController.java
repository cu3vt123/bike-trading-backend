package com.biketrading.backend.controller;

import com.biketrading.backend.entity.User;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // API dành riêng cho Admin: Lấy danh sách toàn bộ User trong hệ thống
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        return ResponseEntity.ok(Map.of(
                "message", "Xin chào Admin! Chào mừng đến với khu vực Quản trị.",
                "totalUsers", users.size(),
                "users", users
        ));
    }
}