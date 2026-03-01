package com.biketrading.backend.controller;

import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.dto.AuthResponse;
import com.biketrading.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtTokenProvider tokenProvider;

    // Lưu ý: Tạm thời mình viết logic đơn giản để anh lấy được Token test đã nhé
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        // Bước này đúng ra phải qua AuthenticationManager, nhưng để anh test nhanh:
        // Giả sử logic kiểm tra username/password trong DB đã xong

        String token = tokenProvider.generateToken(loginRequest.getUsername());

        return ResponseEntity.ok(new AuthResponse(token));
    }
}