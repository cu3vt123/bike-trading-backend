package com.bob.planb.controller;

import com.bob.planb.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class PublicBrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<?> listActiveBrands() {
        // Đã sửa thành Map<String, String> để khớp với kiểu dữ liệu trả về của Map.of()
        List<Map<String, String>> brands = brandRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(b -> Map.of(
                        "id", String.valueOf(b.getId()),
                        "name", b.getName(),
                        "slug", b.getSlug() != null ? b.getSlug() : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", brands));
    }
}