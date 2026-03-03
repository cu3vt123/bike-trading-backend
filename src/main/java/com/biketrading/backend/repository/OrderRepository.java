package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Sửa logic JOIN: o.buyer_id phải JOIN với b.buyer_id (Fix lỗi s.id: {D658CB5F-F249-45AC-AF87-8C26061DA6E3}.jpg)
    @Query(value = "SELECT o.* FROM orders o JOIN buyers b ON o.buyer_id = b.buyer_id WHERE b.username = :username", nativeQuery = true)
    List<Order> findByBuyerUsername(@Param("username") String username);
}