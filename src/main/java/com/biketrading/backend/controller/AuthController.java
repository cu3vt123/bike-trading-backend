package com.biketrading.backend.controller;

import com.biketrading.backend.dto.AuthResponse;
import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private BuyerRepository buyerRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Đăng ký (Signup) cho Buyer
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody Buyer buyer) {
        // 1. Kiểm tra username đã tồn tại chưa
        if (buyerRepository.findByUsername(buyer.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại! Vui lòng chọn tên khác."));
        }

        // 2. Mã hóa mật khẩu
        buyer.setPassword(passwordEncoder.encode(buyer.getPassword()));
        buyer.setCreatedAt(LocalDateTime.now());

        // 3. Lưu vào DB
        buyerRepository.save(buyer);

        return ResponseEntity.status(201).body(Map.of("message", "Đăng ký tài khoản thành công!"));
    }

    // Đăng nhập (Login) cho Buyer
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(request.getUsername());

        // Kiểm tra user có tồn tại và password có khớp không
        if (buyerOpt.isPresent() && passwordEncoder.matches(request.getPassword(), buyerOpt.get().getPassword())) {
            Buyer user = buyerOpt.get();

            // 1. Tạo JWT Token
            String token = tokenProvider.generateToken(user.getUsername());

            // 2. Trả về Token KÈM THEO thông tin cơ bản để Frontend dễ xử lý state
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("buyerId", user.getBuyerId());
            response.put("username", user.getUsername());
            // response.put("role", "BUYER"); // Nếu sau này bạn gộp chung API login với Seller thì thêm trường này

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu!"));
    }
}