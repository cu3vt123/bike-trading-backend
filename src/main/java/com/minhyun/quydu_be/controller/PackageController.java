package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.service.PackageService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listPackages() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched packages", packageService.getPackagesCatalog()));
    }
}
