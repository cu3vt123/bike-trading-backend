package com.biketrading.backend.controller;

import com.biketrading.backend.dto.AuthResponse;
import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Đã xóa dấu @ thừa bị lỗi
public class AuthController {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = tokenProvider.generateToken(request.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(Map.of(
                "username", username,
                "status", "Active",
                "city", "Vũng Tàu" // Một chút thông tin cho Bảo Vũng Tàu nhé
        ));
    }
}