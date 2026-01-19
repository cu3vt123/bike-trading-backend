package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.service.BikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return ResponseEntity.ok(bike);
    }
}