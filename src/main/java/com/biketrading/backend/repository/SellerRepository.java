package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    // Hàm tìm kiếm user để đăng nhập (SHOP-10)
    Seller findByUsernameAndPassword(String username, String password);
}