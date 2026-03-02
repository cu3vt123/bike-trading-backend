package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Sửa s.id thành s.seller_id ở đây:
    @Query(value = "SELECT o.* FROM orders o JOIN sellers s ON o.buyer_id = s.seller_id WHERE s.username = :username", nativeQuery = true)
    List<Order> findByBuyerUsername(@Param("username") String username);
}