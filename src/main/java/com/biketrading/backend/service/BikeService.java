package com.biketrading.backend.service;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BikeService {

    @Autowired
    private BikeRepository bikeRepository;

    // SHOP-15 (BE2) - GIỮ NGUYÊN
    public Bike getBikeById(Long id) {
        return bikeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe có ID: " + id));
    }

    // SHOP-12 (BE1) - THÊM MỚI
    public List<Bike> getAllBikes(Long sellerId) {
        if (sellerId != null) {
            return bikeRepository.findBySellerId(sellerId);
        }
        return bikeRepository.findAll();
    }
}
