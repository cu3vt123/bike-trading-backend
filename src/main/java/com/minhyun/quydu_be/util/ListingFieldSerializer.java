package com.minhyun.quydu_be.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhyun.quydu_be.entity.Listing;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Chuẩn hoá field listing trả về JSON — khớp FE bikeApi / Node serializeListing. */
@Component
public class ListingFieldSerializer {

    private final ObjectMapper objectMapper;

    public ListingFieldSerializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void addExtendedFields(Listing listing, Map<String, Object> target) {
        if (listing.getCondition() != null && !listing.getCondition().isBlank()) {
            target.put("condition", listing.getCondition());
        }
        if (listing.getInspectionResult() != null && !listing.getInspectionResult().isBlank()) {
            target.put("inspectionResult", listing.getInspectionResult());
        }
        if (listing.getInspectionScore() != null) {
            target.put("inspectionScore", listing.getInspectionScore());
        }
        String json = listing.getInspectionReportJson();
        if (json != null && !json.isBlank()) {
            try {
                Map<String, Object> report = objectMapper.readValue(json, new TypeReference<>() {});
                target.put("inspectionReport", report);
            } catch (Exception ignored) {
                target.put("inspectionReport", null);
            }
        }
        if (listing.getSellerShippedToWarehouseAt() != null) {
            target.put("sellerShippedToWarehouseAt", listing.getSellerShippedToWarehouseAt().toString());
        }
        if (listing.getWarehouseIntakeVerifiedAt() != null) {
            target.put("warehouseIntakeVerifiedAt", listing.getWarehouseIntakeVerifiedAt().toString());
        }
    }

    public String inspectionReportToJson(Map<String, Object> report) {
        try {
            return objectMapper.writeValueAsString(report);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid inspection report JSON");
        }
    }

    public static Map<String, Object> buildReportMap(
        int frameScore,
        String frameLabel,
        int driveScore,
        String driveLabel,
        int brakeScore,
        String brakeLabel
    ) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("frameIntegrity", Map.of("score", frameScore, "label", frameLabel));
        m.put("drivetrainHealth", Map.of("score", driveScore, "label", driveLabel));
        m.put("brakingSystem", Map.of("score", brakeScore, "label", brakeLabel));
        return m;
    }
}
