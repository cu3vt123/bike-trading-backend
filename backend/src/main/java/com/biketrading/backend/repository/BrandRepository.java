package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByActiveTrueOrderByNameAsc();
    List<Brand> findAllByOrderByNameAsc();
    Optional<Brand> findByNameIgnoreCase(String name);
}
