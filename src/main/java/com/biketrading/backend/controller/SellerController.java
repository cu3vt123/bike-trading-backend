package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import com.biketrading.backend.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;


@CrossOrigin(origins = "*")

@RestController
@RequestMapping("/api/auth") // Đổi link gốc thành /auth cho đúng chuẩn
public class SellerController {

    @Autowired
    private SellerService sellerService;


    
    // SHOP-11: SIGNUP
    // POST http://localhost:8081/api/sellers/signup
    
    @PostMapping("/signup")
    public ResponseEntity<Seller> signup(@RequestBody Seller seller) {
        Seller createdSeller = sellerService.signup(seller);
        return ResponseEntity.ok(createdSeller);
    }

    
    // SHOP-10: LOGIN
    // POST http://localhost:8081/api/sellers/login
    
    @PostMapping("/login")
    public ResponseEntity<Seller> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Seller seller = sellerService.login(username, password);
        return ResponseEntity.ok(seller);
    }

    
    // SHOP-16: Xem Profile
    // GET http://localhost:8081/api/sellers/{id}
    
    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerProfile(@PathVariable Long id) {
        Seller seller = sellerService.getSellerById(id);
        if (seller != null) {
            return ResponseEntity.ok(seller);
        }
        return ResponseEntity.notFound().build();
    }


    // SHOP-17: Cập nhật Dashboard
    // PUT http://localhost:8081/api/sellers/{id}

    @PutMapping("/{id}")
    public ResponseEntity<Seller> updateSellerProfile(@PathVariable Long id,
                                                      @RequestBody Seller seller) {
        Seller updatedSeller = sellerService.updateSellerProfile(id, seller);
        if (updatedSeller != null) {
            return ResponseEntity.ok(updatedSeller);

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
