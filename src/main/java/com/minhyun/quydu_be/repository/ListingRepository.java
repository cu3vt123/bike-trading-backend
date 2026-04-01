package com.minhyun.quydu_be.repository;

import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingRepository extends BaseRepository<Listing, Long> {

    @Query("""
        SELECT l FROM Listing l
        WHERE l.state = :state
          AND l.hidden = false
          AND (l.listingExpiresAt IS NULL OR l.listingExpiresAt > :now)
        ORDER BY l.createdAt DESC
        """)
    List<Listing> findMarketplaceListings(@Param("state") ListingState state, @Param("now") LocalDateTime now, Pageable pageable);

    List<Listing> findBySellerIdOrderByUpdatedAtDesc(Long sellerId);

    Optional<Listing> findByIdAndSellerId(Long id, Long sellerId);

    List<Listing> findByStateAndHiddenFalseOrderByUpdatedAtDesc(ListingState state);

    List<Listing> findByStateInAndHiddenFalseOrderByUpdatedAtDesc(List<ListingState> states);

    List<Listing> findAllByOrderByCreatedAtDesc();

    /** Mỗi tin không ẩn = 1 lượt đăng (mọi trạng thái, kể cả SOLD). */
    long countBySeller_IdAndHiddenFalse(Long sellerId);

    /**
     * Lượt đăng đang “chiếm” quota: không tính tin {@link com.minhyun.quydu_be.entity.ListingState#REJECTED}
     * (inspector từ chối — seller không bị mất slot vĩnh viễn vì tin đó).
     */
    @Query("""
        SELECT COUNT(l) FROM Listing l
        WHERE l.seller.id = :sellerId AND l.hidden = false AND l.state <> :excluded
        """)
    long countOccupyingPostingSlots(@Param("sellerId") Long sellerId, @Param("excluded") ListingState excluded);
}
