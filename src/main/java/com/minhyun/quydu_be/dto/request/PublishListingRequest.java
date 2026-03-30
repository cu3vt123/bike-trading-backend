package com.minhyun.quydu_be.dto.request;

public class PublishListingRequest {
    private Boolean requestInspection = false;

    public Boolean getRequestInspection() {
        return requestInspection;
    }

    public void setRequestInspection(Boolean requestInspection) {
        this.requestInspection = requestInspection;
    }
}
