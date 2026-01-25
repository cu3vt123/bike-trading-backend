package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
 
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<Seller> findByUsername(String username);
}

    // Hàm tìm kiếm user để đăng nhập (SHOP-10)
    Seller findByUsernameAndPassword(String username, String password);
}
 
