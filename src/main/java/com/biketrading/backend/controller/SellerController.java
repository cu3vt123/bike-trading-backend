package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import com.biketrading.backend.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @Autowired
    private SellerRepository sellerRepository;

    // Signup
    // POST http://localhost:8081/api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<Seller> signup(@RequestBody Seller seller) {
        // Gọi hàm createSeller bên Service (đã sửa lúc nãy)
        return ResponseEntity.ok(sellerService.createSeller(seller));
    }

    //  (Login)
    // POST http://localhost:8081/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Seller loginInfo) {
        // Tìm user trong Database
        Seller user = sellerRepository.findByUsernameAndPassword(loginInfo.getUsername(), loginInfo.getPassword());

        if (user != null) {
            return ResponseEntity.ok(user); // Trả về thông tin nếu đúng
        }
        return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu");
    }

    // xem Profile shop
    // GET http://localhost:8081/api/auth/profile/{id}
    @GetMapping("/profile/{id}")
    public ResponseEntity<Seller> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(sellerService.getSellerById(id));
    }
}