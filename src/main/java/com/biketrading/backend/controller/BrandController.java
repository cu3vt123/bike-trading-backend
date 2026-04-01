package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ApiResponse;
import com.biketrading.backend.entity.Brand;
import com.biketrading.backend.exception.BadRequestException;
import com.biketrading.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping("/brands")
    public ApiResponse<List<Map<String, Object>>> listPublicBrands() {
        List<Map<String, Object>> data = brandRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(b -> Map.<String, Object>of(
                        "id", String.valueOf(b.getId()),
                        "name", b.getName(),
                        "slug", b.getSlug() == null ? "" : b.getSlug()
                ))
                .toList();

        return ApiResponse.of(data);
    }

    @GetMapping("/admin/brands")
    public ApiResponse<List<Map<String, Object>>> listAllBrands() {
        List<Map<String, Object>> data = brandRepository.findAllByOrderByNameAsc()
                .stream()
                .map(b -> Map.<String, Object>of(
                        "id", String.valueOf(b.getId()),
                        "name", b.getName(),
                        "slug", b.getSlug() == null ? "" : b.getSlug(),
                        "active", b.getActive()
                ))
                .toList();

        return ApiResponse.of(data);
    }

    @PostMapping("/admin/brands")
    public ApiResponse<Map<String, Object>> createBrand(@RequestBody Map<String, Object> body) {
        String name = body.get("name") == null ? "" : body.get("name").toString().trim();
        String slug = body.get("slug") == null ? "" : body.get("slug").toString().trim();

        if (name.isBlank()) {
            throw new BadRequestException("Brand name is required");
        }

        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Brand already exists");
        }

        Brand b = new Brand();
        b.setName(name);
        b.setSlug(slug.isBlank() ? toSlug(name) : slug);
        b.setActive(true);

        Brand saved = brandRepository.save(b);

        return ApiResponse.of(Map.of(
                "id", String.valueOf(saved.getId()),
                "name", saved.getName(),
                "slug", saved.getSlug(),
                "active", saved.getActive()
        ));
    }

    @PutMapping("/admin/brands/{id}")
    public ApiResponse<Map<String, Object>> updateBrand(@PathVariable Long id,
                                                        @RequestBody Map<String, Object> body) {
        Brand b = brandRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Brand not found"));

        if (body.containsKey("name")) {
            String name = body.get("name") == null ? "" : body.get("name").toString().trim();
            if (name.isBlank()) throw new BadRequestException("Brand name is required");
            b.setName(name);
        }

        if (body.containsKey("slug")) {
            String slug = body.get("slug") == null ? "" : body.get("slug").toString().trim();
            b.setSlug(slug);
        }

        if (body.containsKey("active")) {
            b.setActive(Boolean.parseBoolean(String.valueOf(body.get("active"))));
        }

        Brand saved = brandRepository.save(b);

        return ApiResponse.of(Map.of(
                "id", String.valueOf(saved.getId()),
                "name", saved.getName(),
                "slug", saved.getSlug() == null ? "" : saved.getSlug(),
                "active", saved.getActive()
        ));
    }

    @DeleteMapping("/admin/brands/{id}")
    public ApiResponse<Map<String, Object>> deleteBrand(@PathVariable Long id) {
        Brand b = brandRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Brand not found"));

        brandRepository.delete(b);
        return ApiResponse.of(Map.of("deleted", true, "id", String.valueOf(id)));
    }

    private String toSlug(String input) {
        return input.toLowerCase().trim().replaceAll("\\s+", "-");
    }
}