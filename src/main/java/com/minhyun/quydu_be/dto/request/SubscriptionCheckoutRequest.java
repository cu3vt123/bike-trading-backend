package com.minhyun.quydu_be.dto.request;

import com.minhyun.quydu_be.entity.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;

public class SubscriptionCheckoutRequest {
    @NotNull
    private SubscriptionPlan plan;
    @NotNull
    private String provider;

    public SubscriptionPlan getPlan() { return plan; }
    public void setPlan(SubscriptionPlan plan) { this.plan = plan; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
