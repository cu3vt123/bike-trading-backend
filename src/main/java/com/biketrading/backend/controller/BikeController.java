package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.service.BikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    // SHOP-15 (BE2): Product Detail
    // GET http://localhost:8081/api/bikes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeDetail(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return ResponseEntity.ok(bike);
    }

    // SHOP-12 (BE1): Product Listing
    // GET http://localhost:8081/api/bikes
    // GET http://localhost:8081/api/bikes?sellerId=1
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes(@RequestParam(required = false) Long sellerId) {
        return ResponseEntity.ok(bikeService.getAllBikes(sellerId));
    }
}
