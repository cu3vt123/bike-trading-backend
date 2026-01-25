package com.biketrading.backend.service;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    // ĐÂY LÀ HÀM BỊ THIẾU (SHOP-11 Signup)
    public Seller createSeller(Seller seller) {
        // Có thể thêm logic kiểm tra trùng username ở đây nếu muốn
        return sellerRepository.save(seller);
    }

    // Hàm lấy thông tin shop (SHOP-16)
    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id).orElse(null);
    }
}