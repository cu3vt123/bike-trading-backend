package com.minhyun.quydu_be.dto.request;

/**
 * Body tùy chọn cho PUT /api/inspector/listings/{id}/approve — khớp Node inspectionReport.
 */
public class InspectorApproveRequest {

    private InspectionReportBody inspectionReport;

    public InspectionReportBody getInspectionReport() {
        return inspectionReport;
    }

    public void setInspectionReport(InspectionReportBody inspectionReport) {
        this.inspectionReport = inspectionReport;
    }

    public static class InspectionReportBody {
        private ReportPart frameIntegrity;
        private ReportPart drivetrainHealth;
        private ReportPart brakingSystem;

        public ReportPart getFrameIntegrity() {
            return frameIntegrity;
        }

        public void setFrameIntegrity(ReportPart frameIntegrity) {
            this.frameIntegrity = frameIntegrity;
        }

        public ReportPart getDrivetrainHealth() {
            return drivetrainHealth;
        }

        public void setDrivetrainHealth(ReportPart drivetrainHealth) {
            this.drivetrainHealth = drivetrainHealth;
        }

        public ReportPart getBrakingSystem() {
            return brakingSystem;
        }

        public void setBrakingSystem(ReportPart brakingSystem) {
            this.brakingSystem = brakingSystem;
        }

        public boolean isComplete() {
            return frameIntegrity != null && drivetrainHealth != null && brakingSystem != null
                && frameIntegrity.score != null && drivetrainHealth.score != null && brakingSystem.score != null;
        }
    }

    public static class ReportPart {
        private Integer score;
        private String label;

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }
    }
}
