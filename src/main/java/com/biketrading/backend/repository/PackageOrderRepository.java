package com.biketrading.backend.repository;

import com.biketrading.backend.entity.PackageOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PackageOrderRepository extends JpaRepository<PackageOrder, Long> {
}