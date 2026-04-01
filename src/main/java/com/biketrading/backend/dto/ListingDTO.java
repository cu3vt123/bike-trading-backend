package com.biketrading.backend.dto;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Spec;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class ListingDTO {
    private String id;
    private String title;
    private String brand;
    private String model;
    private BigDecimal price;
    private BigDecimal msrp;
    private String currency;
    private String location;
    private Integer year;
    private String frameSize;
    private Object condition;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private Object state;
    private Object inspectionResult;
    private Double inspectionScore;
    private String inspectionSummary;
    private String publishedAt;
    private String listingExpiresAt;
    private Map<String, String> specs;
    private Map<String, Object> seller;
    private String description;

    public static ListingDTO fromEntity(Listing l) {
        Map<String, String> specsMap = new LinkedHashMap<>();
        if (l.getSpecs() != null) {
            for (Spec s : l.getSpecs()) {
                specsMap.put(s.getKey(), s.getValue());
            }
        }

        Map<String, Object> sellerMap = null;
        if (l.getSeller() != null) {
            sellerMap = Map.of(
                    "id", String.valueOf(l.getSeller().getId()),
                    "name", l.getSeller().getDisplayName() == null ? "" : l.getSeller().getDisplayName(),
                    "email", l.getSeller().getEmail() == null ? "" : l.getSeller().getEmail()
            );
        }

        return ListingDTO.builder()
                .id(String.valueOf(l.getId()))
                .title(l.getTitle())
                .brand(l.getBrand())
                .model(l.getModel())
                .price(l.getPrice())
                .msrp(l.getMsrp())
                .currency(l.getCurrency())
                .location(l.getLocation())
                .year(l.getYear())
                .frameSize(l.getFrameSize())
                .condition(l.getCondition())
                .thumbnailUrl(l.getThumbnailUrl())
                .imageUrls(l.getImageUrls())
                .state(l.getState())
                .inspectionResult(l.getInspectionResult())
                .inspectionScore(l.getInspectionScore())
                .inspectionSummary(l.getInspectionSummary())
                .publishedAt(l.getPublishedAt() != null ? l.getPublishedAt().toString() : null)
                .listingExpiresAt(l.getListingExpiresAt() != null ? l.getListingExpiresAt().toString() : null)
                .specs(specsMap)
                .seller(sellerMap)
                .description(l.getDescription())
                .build();
    }
}