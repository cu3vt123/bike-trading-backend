package com.biketrading.backend.service;

import com.biketrading.backend.dto.SellerSubscriptionSummary;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SubscriptionService {

    @Value("${app.listingDurationDays}")
    private int listingDurationDays;

    public SellerSubscriptionSummary buildSummary(User user) {
        if (user == null || user.getRole() != Role.SELLER) {
            return new SellerSubscriptionSummary(false, null, null, 0, 0, listingDurationDays);
        }

        boolean active = isActive(user);
        int limit = getLimit(user.getSubscriptionPlan());

        return new SellerSubscriptionSummary(
                active,
                user.getSubscriptionPlan(),
                user.getSubscriptionExpiresAt() != null ? user.getSubscriptionExpiresAt().toString() : null,
                0,
                active ? limit : 0,
                listingDurationDays
        );
    }

    private boolean isActive(User user) {
        if (user.getSubscriptionPlan() == null || user.getSubscriptionExpiresAt() == null) {
            return false;
        }
        return user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now());
    }

    private int getLimit(SubscriptionPlan plan) {
        if (plan == SubscriptionPlan.BASIC) return 7;
        if (plan == SubscriptionPlan.VIP) return 15;
        return 0;
    }
}