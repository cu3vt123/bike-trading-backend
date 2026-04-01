package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Review;
import com.biketrading.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Review> findBySellerOrderByCreatedAtDesc(User seller);
}
