package com.biketrading.backend.service;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

@Service
public class BikeService {

    @Autowired
    private BikeRepository bikeRepository;

    // SHOP-15 (BE2) - GIỮ NGUYÊN
    public Bike getBikeById(Long id) {
        return bikeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Bike not found"));
    }

    // SHOP-12 (BE1) - THÊM MỚI
    public List<Bike> getAllBikes(Long sellerId) {
        if (sellerId != null) {
            return bikeRepository.findBySellerId(sellerId);
        }
        return bikeRepository.findAll();
    }
}
