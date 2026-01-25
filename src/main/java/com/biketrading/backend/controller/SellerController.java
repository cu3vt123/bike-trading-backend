package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import com.biketrading.backend.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth") // Đổi link gốc thành /auth cho đúng chuẩn
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @Autowired
    private SellerRepository sellerRepository;

    // SHOP-11: Đăng ký tài khoản (Signup)
    // Link: POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<Seller> signup(@RequestBody Seller seller) {
        return ResponseEntity.ok(sellerService.createSeller(seller));
    }

    // SHOP-10: Đăng nhập (Login)
    // Link: POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Seller loginInfo) {
        Seller user = sellerRepository.findByUsernameAndPassword(loginInfo.getUsername(), loginInfo.getPassword());
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu");
    }

    // Lấy thông tin Profile shop
    // Link: GET /api/auth/profile/{id}
    @GetMapping("/profile/{id}")
    public ResponseEntity<Seller> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(sellerService.getSellerById(id));
    }
}