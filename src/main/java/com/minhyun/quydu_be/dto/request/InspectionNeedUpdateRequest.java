package com.minhyun.quydu_be.dto.request;

import jakarta.validation.constraints.NotBlank;

public class InspectionNeedUpdateRequest {
    @NotBlank
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
