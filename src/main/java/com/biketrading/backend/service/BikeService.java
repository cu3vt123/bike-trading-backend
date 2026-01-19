package com.biketrading.backend.service;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BikeService {

    @Autowired
    private BikeRepository bikeRepository;

    public Bike getBikeById(Long id) {
        return bikeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe có ID: " + id));
    }
}