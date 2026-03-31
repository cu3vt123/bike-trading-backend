package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.service.PackageService;
import com.minhyun.quydu_be.web.RestResponses;
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
    public ResponseEntity<Map<String, Object>> listPackages() {
        return RestResponses.okData(packageService.getPackagesCatalog());
    }
}

