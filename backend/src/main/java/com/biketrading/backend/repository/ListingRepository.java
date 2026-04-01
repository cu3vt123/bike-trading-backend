package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findBySeller(User seller);
    List<Listing> findByState(ListingState state);
    List<Listing> findByStateAndIsHiddenFalse(ListingState state);
    long countBySellerAndState(User seller, ListingState state);
    long countByListingExpiresAtBefore(LocalDateTime time);
}
