package com.biketrading.backend.dto;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.enums.Condition;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ListingDTO {
    private Long id;
    private String title;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal price;
    private String currency;
    private Condition condition;
    private String frameSize;
    private String location;
    private String description;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private ListingState state;
    private InspectionResult inspectionResult;
    private Double inspectionScore;

    // --- TRƯỜNG ĐÁNH DẤU TÍCH XANH ---
    private Boolean isVerified;

    private String sellerUsername;

    public static ListingDTO fromEntity(Listing listing) {
        ListingDTO dto = new ListingDTO();
        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setBrand(listing.getBrand());
        dto.setModel(listing.getModel());
        dto.setYear(listing.getYear());
        dto.setPrice(listing.getPrice());
        dto.setCurrency(listing.getCurrency());
        dto.setCondition(listing.getCondition());
        dto.setFrameSize(listing.getFrameSize());
        dto.setLocation(listing.getLocation());
        dto.setDescription(listing.getDescription());
        dto.setThumbnailUrl(listing.getThumbnailUrl());
        dto.setImageUrls(listing.getImageUrls());
        dto.setState(listing.getState());
        dto.setInspectionResult(listing.getInspectionResult());
        dto.setInspectionScore(listing.getInspectionScore());

        // Gán giá trị tích xanh từ Entity (Database) sang DTO (Frontend)
        dto.setIsVerified(listing.getIsVerified());

        if (listing.getSeller() != null) {
            dto.setSellerUsername(listing.getSeller().getUsername());
        }
        return dto;
    }
}