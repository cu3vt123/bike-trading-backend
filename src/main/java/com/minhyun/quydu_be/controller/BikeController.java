package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.service.BikeService;
import com.minhyun.quydu_be.web.RestResponses;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    private final BikeService bikeService;

    public BikeController(BikeService bikeService) {
        this.bikeService = bikeService;
    }

    /** Public listing: body shape { "content": [...] } (ShopBike FE contract). */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listBikes() {
        return RestResponses.okContent(bikeService.listBikes());
    }

    /** Single bike: body shape { "data": { ... } }. */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBike(@PathVariable Long id) {
        return RestResponses.okData(bikeService.getBikeById(id));
    }
}
