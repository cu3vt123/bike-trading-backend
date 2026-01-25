package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
 
import org.springframework.stereotype.Repository;
import java.util.List;


import java.util.List;

public interface BikeRepository extends JpaRepository<Bike, Long> {
 

    // SHOP-12: Lấy danh sách xe theo seller
    List<Bike> findBySellerId(Long sellerId);
}
    // Hàm tìm xe theo tên (SHOP-12)
    List<Bike> findByNameContaining(String keyword);
}
 
