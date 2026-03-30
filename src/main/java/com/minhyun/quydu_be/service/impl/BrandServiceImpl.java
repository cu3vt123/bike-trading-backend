package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.entity.Brand;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.BrandRepository;
import com.minhyun.quydu_be.service.BrandService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    public BrandServiceImpl(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Override
    public List<Map<String, Object>> listActiveBrands() {
        List<Brand> brands = brandRepository.findByActiveTrueOrderByNameAsc();
        return brands.stream().map(this::toBrandMap).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> adminListBrands() {
        List<Brand> brands = brandRepository.findAllByOrderByNameAsc();
        return brands.stream().map(this::toBrandMapWithActive).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> adminCreateBrand(String name, String slug) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new BadRequestException("Brand name is required");
        }
        if (brandRepository.findByNameIgnoreCase(trimmed).isPresent()) {
            throw new BadRequestException("Brand already exists");
        }
        Brand b = new Brand();
        b.setName(trimmed);
        b.setSlug((slug == null || slug.trim().isEmpty()) ? slugify(trimmed) : slug.trim());
        b.setActive(true);
        brandRepository.save(b);
        return toBrandMapWithActive(b);
    }

    @Override
    public Map<String, Object> adminUpdateBrand(Long id, String name, String slug, Boolean active) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        if (name != null && !name.trim().isEmpty()) {
            String trimmed = name.trim();
            brandRepository.findByNameIgnoreCase(trimmed).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Brand name already exists");
                }
            });
            b.setName(trimmed);
        }
        if (slug != null) b.setSlug(slug.trim());
        if (active != null) b.setActive(active);
        brandRepository.save(b);
        return toBrandMapWithActive(b);
    }

    @Override
    public Map<String, Object> adminDeleteBrand(Long id) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        brandRepository.delete(b);
        return Map.of("deleted", true, "id", id);
    }

    private Map<String, Object> toBrandMap(Brand b) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", b.getId());
        item.put("name", b.getName());
        item.put("slug", b.getSlug() == null ? "" : b.getSlug());
        return item;
    }

    private Map<String, Object> toBrandMapWithActive(Brand b) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", b.getId());
        item.put("name", b.getName());
        item.put("slug", b.getSlug() == null ? "" : b.getSlug());
        item.put("active", b.isActive());
        return item;
    }

    private String slugify(String value) {
        return value.toLowerCase().replaceAll("\\s+", "-");
    }
}
