package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByActiveTrueOrderByNameAsc();
    List<Brand> findAllByOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}