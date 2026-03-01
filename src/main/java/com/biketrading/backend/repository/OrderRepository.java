package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Truy vấn trực tiếp vào bảng 'orders' và 'sellers' để tìm theo username
    @Query(value = "SELECT o.* FROM orders o JOIN sellers s ON o.buyer_id = s.id WHERE s.username = :username", nativeQuery = true)
    List<Order> findByBuyerUsername(@Param("username") String username);
}