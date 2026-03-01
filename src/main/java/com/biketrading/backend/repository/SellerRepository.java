package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {

    // SHOP-10
    Seller findByUsernameAndPassword(String username, String password);

    // SHOP-32 (seed idempotent)
    Optional<Seller> findByUsername(String username);
}