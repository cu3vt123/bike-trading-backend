package com.minhyun.quydu_be.dto.request;

import jakarta.validation.constraints.NotBlank;

public class InspectorRejectRequest {

    @NotBlank(message = "REJECTION_REASON_REQUIRED")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
