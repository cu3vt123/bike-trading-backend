package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    // Xem hồ sơ shop: GET http://localhost:8080/api/sellers/1
    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerProfile(@PathVariable Long id) {
        Seller seller = sellerService.getSellerById(id);
        return ResponseEntity.ok(seller);
    }
}