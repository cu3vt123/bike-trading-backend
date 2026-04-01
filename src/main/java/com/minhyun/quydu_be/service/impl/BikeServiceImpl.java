package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.service.BikeService;
import com.minhyun.quydu_be.util.ListingFieldSerializer;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class BikeServiceImpl implements BikeService {

    private final ListingRepository listingRepository;
    private final ListingFieldSerializer listingFieldSerializer;

    public BikeServiceImpl(ListingRepository listingRepository, ListingFieldSerializer listingFieldSerializer) {
        this.listingRepository = listingRepository;
        this.listingFieldSerializer = listingFieldSerializer;
    }

    @Override
    public List<Map<String, Object>> listBikes() {
        List<Listing> items = listingRepository.findMarketplaceListings(
            ListingState.PUBLISHED,
            LocalDateTime.now(),
            PageRequest.of(0, 200)
        );
        return items.stream().map(this::toBikeMap).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getBikeById(Long id) {
        Listing item = listingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));

        if (item.isHidden() || item.getState() != ListingState.PUBLISHED) {
            throw new ResourceNotFoundException("Bike not found");
        }

        LocalDateTime now = LocalDateTime.now();
        if (item.getListingExpiresAt() != null && !item.getListingExpiresAt().isAfter(now)) {
            throw new ResourceNotFoundException("Bike not found");
        }

        return toBikeMap(item);
    }

    private Map<String, Object> toBikeMap(Listing listing) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", listing.getId());
        item.put("title", nvl(listing.getTitle()));
        item.put("brand", nvl(listing.getBrand()));
        item.put("model", nvl(listing.getModel()));
        item.put("year", listing.getYear());
        item.put("frameSize", nvl(listing.getFrameSize()));
        item.put("price", listing.getPrice());
        item.put("msrp", listing.getMsrp());
        item.put("currency", nvl(listing.getCurrency()));
        item.put("location", nvl(listing.getLocation()));
        item.put("thumbnailUrl", nvl(listing.getThumbnailUrl()));
        item.put("imageUrls", listing.getImageUrls() == null ? List.of() : listing.getImageUrls());
        item.put("state", listing.getState().name());
        String cert = listing.getCertificationStatus();
        item.put("certificationStatus", (cert == null || cert.isBlank()) ? "UNVERIFIED" : cert);
        item.put("publishedAt", listing.getPublishedAt());
        item.put("listingExpiresAt", listing.getListingExpiresAt());
        item.put("description", listing.getDescription() == null ? "" : listing.getDescription());
        item.put("createdAt", listing.getCreatedAt());
        item.put("updatedAt", listing.getUpdatedAt());
        listingFieldSerializer.addExtendedFields(listing, item);
        return item;
    }

    private String nvl(String value) {
        return value == null ? "" : value;
    }
}
