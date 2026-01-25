package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BikeRepository extends JpaRepository<Bike, Long> {

    // SHOP-12: Lấy danh sách xe theo seller
    List<Bike> findBySellerId(Long sellerId);
}
