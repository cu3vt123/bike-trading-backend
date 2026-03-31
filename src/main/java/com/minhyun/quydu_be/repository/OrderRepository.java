package com.minhyun.quydu_be.repository;

import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderStatus;
import com.minhyun.quydu_be.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends BaseRepository<Order, Long> {
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);

    @Query("SELECT o FROM Order o WHERE o.listing.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<Order> findSellerOrders(@Param("sellerId") Long sellerId);

    long countByBuyerAndStatusAndUpdatedAtAfter(User buyer, OrderStatus status, java.time.LocalDateTime since);

    List<Order> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    Optional<Order> findTopByBuyerAndListingIdAndStatusInOrderByCreatedAtDesc(
        User buyer,
        Long listingId,
        List<OrderStatus> statuses
    );

    Optional<Order> findTopByListingIdAndStatusInOrderByCreatedAtDesc(
        Long listingId,
        List<OrderStatus> statuses
    );
}
