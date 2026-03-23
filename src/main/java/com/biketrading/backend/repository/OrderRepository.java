package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    Optional<Order> findByIdAndBuyerId(Long id, Long buyerId);

    List<Order> findByListingSellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<Order> findByVnpayTxnRef(String vnpayTxnRef);
}