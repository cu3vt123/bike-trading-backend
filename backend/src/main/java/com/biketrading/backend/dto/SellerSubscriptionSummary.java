package com.biketrading.backend.dto;

import com.biketrading.backend.enums.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SellerSubscriptionSummary {
    private boolean active;
    private SubscriptionPlan plan;
    private String expiresAt;
    private int publishedSlotsUsed;
    private int publishedSlotsLimit;
    private int listingDurationDays;
}