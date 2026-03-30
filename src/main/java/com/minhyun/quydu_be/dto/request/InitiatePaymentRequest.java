package com.minhyun.quydu_be.dto.request;

import jakarta.validation.constraints.NotBlank;

public class InitiatePaymentRequest {

    @NotBlank
    private String method;

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
