package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BikeRepository extends JpaRepository<Bike, Long> {
    // Hàm tìm xe theo tên (SHOP-12)
    List<Bike> findByNameContaining(String keyword);
}