package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.service.BrandService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listBrands() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched brands", brandService.listActiveBrands()));
    }
}
