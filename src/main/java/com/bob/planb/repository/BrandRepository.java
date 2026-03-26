package com.bob.planb.repository;

import com.bob.planb.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    // Tương đương Brand.find({ active: true }).sort({ name: 1 })
    List<Brand> findByActiveTrueOrderByNameAsc();

    // Tương đương Brand.find().sort({ name: 1 })
    List<Brand> findAllByOrderByNameAsc();

    // Kiểm tra tên trùng lặp khi tạo mới
    boolean existsByNameIgnoreCase(String name);

    // Kiểm tra tên trùng lặp khi cập nhật (bỏ qua chính nó)
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}