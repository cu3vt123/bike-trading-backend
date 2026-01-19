package com.biketrading.backend.service;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SellerService {
    @Autowired
    private SellerRepository sellerRepository;

    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người bán có ID: " + id));
    }
}