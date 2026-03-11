package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStateAndInspectionResult(ListingState state, InspectionResult inspectionResult);
}