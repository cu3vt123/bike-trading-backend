package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Brand;
import com.biketrading.backend.repository.BrandRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class BrandsController {
    private final BrandRepository brandRepository;

    public BrandsController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @GetMapping("/api/brands")
    public ResponseEntity<?> listActive() {
        List<?> items = brandRepository.findByActiveTrueOrderByNameAsc().stream().map(MapperUtil::brandDto).collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @GetMapping("/api/admin/brands")
    public ResponseEntity<?> adminList() {
        List<?> items = brandRepository.findAllByOrderByNameAsc().stream().map(MapperUtil::brandDto).collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PostMapping("/api/admin/brands")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name = String.valueOf(body.getOrDefault("name", "")).trim();
        if (name.isBlank()) return ApiResponse.error(HttpStatus.BAD_REQUEST, "Brand name is required");
        if (brandRepository.findByNameIgnoreCase(name).isPresent()) return ApiResponse.error(HttpStatus.BAD_REQUEST, "Brand already exists");
        Brand b = new Brand();
        b.setName(name);
        String slug = String.valueOf(body.getOrDefault("slug", name.toLowerCase().replace(" ", "-"))).trim();
        b.setSlug(slug.isBlank() ? name.toLowerCase().replace(" ", "-") : slug);
        b.setActive(true);
        brandRepository.save(b);
        return ApiResponse.created(MapperUtil.brandDto(b));
    }

    @PutMapping("/api/admin/brands/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Brand b = brandRepository.findById(id).orElse(null);
        if (b == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Brand not found");
        if (body.containsKey("name")) {
            String name = String.valueOf(body.get("name")).trim();
            if (!name.isBlank()) b.setName(name);
        }
        if (body.containsKey("slug")) b.setSlug(String.valueOf(body.get("slug")).trim());
        if (body.containsKey("active")) b.setActive(Boolean.parseBoolean(String.valueOf(body.get("active"))));
        brandRepository.save(b);
        return ApiResponse.ok(MapperUtil.brandDto(b));
    }

    @DeleteMapping("/api/admin/brands/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Brand b = brandRepository.findById(id).orElse(null);
        if (b == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Brand not found");
        brandRepository.delete(b);
        return ApiResponse.ok(Map.of("deleted", true, "id", String.valueOf(id)));
    }
}
