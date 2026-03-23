package com.biketrading.backend.repository;

import com.biketrading.backend.entity.PackageOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PackageOrderRepository extends JpaRepository<PackageOrder, Long> {
    Optional<PackageOrder> findByTxnRef(String txnRef);
}