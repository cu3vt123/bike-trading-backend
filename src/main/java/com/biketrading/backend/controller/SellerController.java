package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    // 1. API Xem Profile (SHOP-16)
    // GET http://localhost:8081/api/sellers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerProfile(@PathVariable Long id) {
        Seller seller = sellerService.getSellerById(id);
        if (seller != null) {
            return ResponseEntity.ok(seller);
        }
        return ResponseEntity.notFound().build();
    }

    // 2. API Cập nhật thông tin Dashboard (SHOP-17)
    // PUT http://localhost:8081/api/sellers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Seller> updateSellerProfile(@PathVariable Long id, @RequestBody Seller seller) {
        Seller updatedSeller = sellerService.updateSellerProfile(id, seller);
        if (updatedSeller != null) {
            return ResponseEntity.ok(updatedSeller);
        }
        return ResponseEntity.notFound().build();
    }
}