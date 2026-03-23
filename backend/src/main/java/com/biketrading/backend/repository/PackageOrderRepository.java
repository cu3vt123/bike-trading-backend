package com.biketrading.backend.repository;

import com.biketrading.backend.entity.PackageOrder;
import com.biketrading.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackageOrderRepository extends JpaRepository<PackageOrder, Long> {
    List<PackageOrder> findTop5BySellerOrderByCreatedAtDesc(User seller);
}
