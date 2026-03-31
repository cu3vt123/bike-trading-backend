package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.service.BrandService;
import com.minhyun.quydu_be.web.RestResponses;
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
    public ResponseEntity<Map<String, Object>> listBrands() {
        return RestResponses.okData(brandService.listActiveBrands());
    }
}
