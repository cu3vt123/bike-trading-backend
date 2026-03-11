package com.biketrading.backend.dto;

import com.biketrading.backend.entity.Listing;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
public class ListingDTO {
    private String id; // Frontend đang cần id dạng chuỗi
    private String title;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal price;
    private BigDecimal msrp;
    private String currency;
    private String frameSize;
    private String condition;
    private String location;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private String state;
    private String inspectionResult;
    private Double inspectionScore;
    private String description;

    // Danh sách thông số kỹ thuật (đã thêm ở bước 16)
    private List<Map<String, String>> specs;

    // Thông tin người bán thu gọn
    private Map<String, Object> seller;

    // Hàm chuyển đổi từ Entity sang DTO
    public static ListingDTO fromEntity(Listing listing) {
        if (listing == null) return null;

        ListingDTO dto = new ListingDTO();
        dto.setId(String.valueOf(listing.getId()));
        dto.setTitle(listing.getTitle());
        dto.setBrand(listing.getBrand());
        dto.setModel(listing.getModel());
        dto.setYear(listing.getYear());
        dto.setPrice(listing.getPrice());
        dto.setMsrp(listing.getMsrp());
        dto.setCurrency(listing.getCurrency());
        dto.setFrameSize(listing.getFrameSize());

        // Chuyển Enum sang String để Frontend đọc được
        dto.setCondition(listing.getCondition() != null ? listing.getCondition().name() : null);
        dto.setState(listing.getState() != null ? listing.getState().name() : null);
        dto.setInspectionResult(listing.getInspectionResult() != null ? listing.getInspectionResult().name() : null);

        dto.setLocation(listing.getLocation());
        dto.setThumbnailUrl(listing.getThumbnailUrl());
        dto.setImageUrls(listing.getImageUrls());
        dto.setInspectionScore(listing.getInspectionScore());
        dto.setDescription(listing.getDescription());

        // Chuyển đổi List<Spec> sang List<Map> theo chuẩn JSON của Frontend
        if (listing.getSpecs() != null && !listing.getSpecs().isEmpty()) {
            dto.setSpecs(listing.getSpecs().stream()
                    .map(spec -> Map.of("label", spec.getLabel(), "value", spec.getValue()))
                    .collect(Collectors.toList()));
        }

        // Lấy thông tin người bán (Seller)
        if (listing.getSeller() != null) {
            dto.setSeller(Map.of(
                    "id", "U" + listing.getSeller().getId(), // Thêm tiền tố U cho giống ID string của Frontend
                    "name", listing.getSeller().getDisplayName() != null ? listing.getSeller().getDisplayName() : listing.getSeller().getUsername(),
                    "email", listing.getSeller().getEmail() != null ? listing.getSeller().getEmail() : ""
            ));
        }

        return dto;
    }
}