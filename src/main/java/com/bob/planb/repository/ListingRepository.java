package com.bob.planb.repository;

import com.bob.planb.entity.Listing;
import com.bob.planb.entity.ListingState;
import com.bob.planb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    // Dành cho Seller
    List<Listing> findBySeller(User seller);

    // Dành cho Admin (Lọc theo nhiều trạng thái)
    List<Listing> findByStateInAndIsHiddenFalseOrderByUpdatedAtDesc(List<ListingState> states);

    // Dành cho Khách xem xe
    @Query("SELECT l FROM Listing l WHERE l.state = :state AND l.isHidden = false AND (l.listingExpiresAt > :now OR l.listingExpiresAt IS NULL) ORDER BY l.createdAt DESC")
    List<Listing> findAvailableBikes(@Param("state") ListingState state, @Param("now") LocalDateTime now);

    // DÀNH CHO INSPECTOR (FIX LỖI CỦA BẠN TẠI ĐÂY)
    // Tìm xe theo 1 trạng thái cụ thể (ví dụ: PENDING_INSPECTION) và không bị ẩn
    List<Listing> findByStateAndIsHiddenFalseOrderByUpdatedAtDesc(ListingState state);
}