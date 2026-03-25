package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findByStateAndInspectionResultAndIsHiddenFalseOrderByIdDesc(
            ListingState state,
            InspectionResult inspectionResult
    );

    @Query("""
        select count(l)
        from Listing l
        where l.seller.id = :sellerId
          and l.isHidden = false
          and l.state in :states
          and (l.listingExpiresAt is null or l.listingExpiresAt > :now)
    """)
    long countActiveSlots(
            @Param("sellerId") Long sellerId,
            @Param("states") Collection<ListingState> states,
            @Param("now") LocalDateTime now
    );
}