package com.biketrading.backend.service;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    // Phục vụ SHOP-16: Xem hồ sơ (Profile)
    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id).orElse(null);
    }

    // Phục vụ SHOP-17: Cập nhật thông tin (Dashboard)
    public Seller updateSellerProfile(Long id, Seller newInfo) {
        return sellerRepository.findById(id)
                .map(seller -> {
                    // Chỉ cho sửa những thông tin cơ bản
                    seller.setPhone(newInfo.getPhone());
                    seller.setEmail(newInfo.getEmail());
                    seller.setShopName(newInfo.getShopName());
                    // Lưu ý: Không cho sửa username/password ở đây cho an toàn
                    return sellerRepository.save(seller);
                }).orElse(null);
    }
}