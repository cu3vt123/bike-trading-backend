package com.bob.planb.dto;

import lombok.Data;

@Data
public class ApproveListingRequest {
    private InspectionReportDto inspectionReport;

    @Data
    public static class InspectionReportDto {
        private ScoreLabel frameIntegrity;
        private ScoreLabel drivetrainHealth;
        private ScoreLabel brakingSystem;
    }

    @Data
    public static class ScoreLabel {
        private Double score;
        private String label;
    }
}