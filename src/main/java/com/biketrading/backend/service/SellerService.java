package com.biketrading.backend.service;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    // SHOP-11: Tạo tài khoản mới (Controller đang gọi hàm này)
    public Seller createSeller(Seller seller) {
        // Nếu muốn kiểm tra trùng username thì thêm logic ở đây sau
        // Tạm thời lưu thẳng để chạy được SHOP-11
        return sellerRepository.save(seller);
    }

    // SHOP-16: Xem hồ sơ (Profile)
    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id).orElse(null);
    }

    // SHOP-17: Cập nhật thông tin (Dashboard)
    public Seller updateSellerProfile(Long id, Seller newInfo) {
        return sellerRepository.findById(id)
                .map(seller -> {
                    // Chỉ cập nhật những trường cho phép
                    if (newInfo.getPhone() != null) seller.setPhone(newInfo.getPhone());
                    if (newInfo.getEmail() != null) seller.setEmail(newInfo.getEmail());
                    if (newInfo.getShopName() != null) seller.setShopName(newInfo.getShopName());
                    return sellerRepository.save(seller);
                }).orElse(null);
    }
}