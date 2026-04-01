package com.bob.planb.controller;

import com.bob.planb.dto.BrandRequest;
import com.bob.planb.entity.Brand;
import com.bob.planb.repository.BrandRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<?> listAllBrands() {
        // Dùng HashMap truyền thống để chứa lộn xộn cả String (name) và Boolean (active) một cách an toàn nhất
        List<Map<String, Object>> brands = brandRepository.findAllByOrderByNameAsc()
                .stream()
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", String.valueOf(b.getId()));
                    map.put("name", b.getName());
                    map.put("slug", b.getSlug() != null ? b.getSlug() : "");
                    map.put("active", b.isActive());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", brands));
    }

    @PostMapping
    public ResponseEntity<?> createBrand(@Valid @RequestBody BrandRequest request) {
        String name = request.getName().trim();

        if (brandRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Brand already exists"));
        }

        // Tự động tạo slug nếu không truyền lên (viết thường và thay dấu cách bằng dấu gạch ngang)
        String slug = (request.getSlug() != null && !request.getSlug().trim().isEmpty())
                ? request.getSlug().trim()
                : name.toLowerCase().replaceAll("\\s+", "-");

        Brand brand = Brand.builder()
                .name(name)
                .slug(slug)
                .active(true)
                .build();

        brandRepository.save(brand);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", String.valueOf(brand.getId()));
        responseData.put("name", brand.getName());
        responseData.put("slug", brand.getSlug());
        responseData.put("active", brand.isActive());

        return ResponseEntity.status(201).body(Map.of("data", responseData));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @RequestBody BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        // Cập nhật tên nếu có
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String name = request.getName().trim();
            // Kiểm tra trùng tên (nhưng bỏ qua chính nó)
            if (brandRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Brand name already exists"));
            }
            brand.setName(name);
        }

        if (request.getSlug() != null) {
            brand.setSlug(request.getSlug().trim());
        }

        if (request.getActive() != null) {
            brand.setActive(request.getActive());
        }

        brandRepository.save(brand);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", String.valueOf(brand.getId()));
        responseData.put("name", brand.getName());
        responseData.put("slug", brand.getSlug());
        responseData.put("active", brand.isActive());

        return ResponseEntity.ok(Map.of("data", responseData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Brand not found"));
        }

        brandRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("data", Map.of(
                "deleted", true,
                "id", String.valueOf(id)
        )));
    }
}