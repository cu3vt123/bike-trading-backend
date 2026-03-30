package com.minhyun.quydu_be.dto.request;

public class WarehouseReInspectionRequest {
    private String action;
    private String reason;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
