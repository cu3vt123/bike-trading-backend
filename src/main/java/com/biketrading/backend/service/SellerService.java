package com.biketrading.backend.service;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // SHOP-11: Signup
    public Seller signup(Seller req) {
        if (req.getUsername() == null || req.getUsername().isBlank())
            throw new RuntimeException("username is required");
        if (req.getPassword() == null || req.getPassword().isBlank())
            throw new RuntimeException("password is required");
        if (req.getEmail() == null || req.getEmail().isBlank())
            throw new RuntimeException("email is required");

        String username = req.getUsername().trim();
        String email = req.getEmail().trim();

        if (sellerRepository.existsByUsername(username))
            throw new RuntimeException("username already exists");
        if (sellerRepository.existsByEmail(email))
            throw new RuntimeException("email already exists");

        Seller s = new Seller();
        s.setUsername(username);
        s.setEmail(email);
        s.setPhone(req.getPhone());
        s.setShopName(req.getShopName());
        s.setReputationScore(0.0);

        // hash password trước khi lưu
        s.setPassword(encoder.encode(req.getPassword()));

        return sellerRepository.save(s);
    }

    // SHOP-10: Login
    public Seller login(String username, String password) {
        if (username == null || username.isBlank())
            throw new RuntimeException("username is required");
        if (password == null || password.isBlank())
            throw new RuntimeException("password is required");

        Seller seller = sellerRepository.findByUsername(username.trim())
                .orElseThrow(() -> new RuntimeException("seller not found"));

        if (!encoder.matches(password, seller.getPassword()))
            throw new RuntimeException("wrong password");

        return seller;
    }

    // SHOP-16: Xem hồ sơ (Profile)
    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id).orElse(null);
    }

    // SHOP-17: Cập nhật thông tin (Dashboard)
    public Seller updateSellerProfile(Long id, Seller newInfo) {
        return sellerRepository.findById(id)
                .map(seller -> {
                    seller.setPhone(newInfo.getPhone());
                    seller.setEmail(newInfo.getEmail());
                    seller.setShopName(newInfo.getShopName());
                    return sellerRepository.save(seller);
                }).orElse(null);
    }
}
