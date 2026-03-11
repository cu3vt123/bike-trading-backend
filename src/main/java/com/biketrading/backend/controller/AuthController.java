package com.biketrading.backend.controller;

import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.dto.SignupRequest;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Inspector;
import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.InspectorRepository;
import com.biketrading.backend.repository.SellerRepository;
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
    @Autowired private SellerRepository sellerRepository;
    @Autowired private InspectorRepository inspectorRepository; // Thêm Inspector Repository
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        Map<String, Object> response = new HashMap<>();

        if ("SELLER".equalsIgnoreCase(request.getRole())) {
            if (sellerRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại!"));
            }
            Seller seller = new Seller();
            seller.setUsername(request.getUsername());
            seller.setEmail(request.getEmail());
            seller.setPassword(passwordEncoder.encode(request.getPassword()));
            seller.setPhone(request.getPhone());
            seller.setCreatedAt(LocalDateTime.now());
            sellerRepository.save(seller);

            String token = tokenProvider.generateToken(seller.getUsername());
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("sellerId", seller.getSellerId());
            response.put("username", seller.getUsername());
            response.put("role", "SELLER");

        } else if ("INSPECTOR".equalsIgnoreCase(request.getRole())) { // Nhánh tạo Inspector để test
            if (inspectorRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại!"));
            }
            Inspector inspector = new Inspector();
            inspector.setUsername(request.getUsername());
            inspector.setEmail(request.getEmail());
            inspector.setPassword(passwordEncoder.encode(request.getPassword()));
            inspectorRepository.save(inspector);

            String token = tokenProvider.generateToken(inspector.getUsername());
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("inspectorId", inspector.getInspectorId());
            response.put("username", inspector.getUsername());
            response.put("role", "INSPECTOR");

        } else { // Mặc định là BUYER
            if (buyerRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại!"));
            }
            Buyer buyer = new Buyer();
            buyer.setUsername(request.getUsername());
            buyer.setEmail(request.getEmail());
            buyer.setPassword(passwordEncoder.encode(request.getPassword()));
            buyer.setPhone(request.getPhone());
            buyer.setAddress(request.getAddress());
            buyer.setCreatedAt(LocalDateTime.now());
            buyerRepository.save(buyer);

            String token = tokenProvider.generateToken(buyer.getUsername());
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("buyerId", buyer.getBuyerId());
            response.put("username", buyer.getUsername());
            response.put("role", "BUYER");
        }

        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // 1. Check bảng Buyer trước
        Optional<Buyer> buyerOpt = buyerRepository.findByUsername(request.getUsername());
        if (buyerOpt.isPresent() && passwordEncoder.matches(request.getPassword(), buyerOpt.get().getPassword())) {
            Buyer user = buyerOpt.get();
            String token = tokenProvider.generateToken(user.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("buyerId", user.getBuyerId());
            response.put("username", user.getUsername());
            response.put("role", "BUYER");
            return ResponseEntity.ok(response);
        }

        // 2. Nếu không phải Buyer, check tiếp bảng Seller
        Optional<Seller> sellerOpt = sellerRepository.findByUsername(request.getUsername());
        if (sellerOpt.isPresent() && passwordEncoder.matches(request.getPassword(), sellerOpt.get().getPassword())) {
            Seller user = sellerOpt.get();
            String token = tokenProvider.generateToken(user.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("sellerId", user.getSellerId());
            response.put("username", user.getUsername());
            response.put("role", "SELLER");
            return ResponseEntity.ok(response);
        }

        // 3. Nếu không phải Seller, check bảng Inspector (MỚI THÊM)
        Optional<Inspector> inspectorOpt = inspectorRepository.findByUsername(request.getUsername());
        if (inspectorOpt.isPresent() && passwordEncoder.matches(request.getPassword(), inspectorOpt.get().getPassword())) {
            Inspector user = inspectorOpt.get();
            String token = tokenProvider.generateToken(user.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            response.put("inspectorId", user.getInspectorId());
            response.put("username", user.getUsername());
            response.put("role", "INSPECTOR");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu!"));
    }
}