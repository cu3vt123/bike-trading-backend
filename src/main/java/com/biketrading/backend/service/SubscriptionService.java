package com.biketrading.backend.service;

import com.biketrading.backend.dto.SellerSubscriptionSummary;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionService {

    private final ListingRepository listingRepository;

    @Value("${app.listingDurationDays}")
    private int listingDurationDays;

    public SubscriptionService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public SellerSubscriptionSummary buildSummary(User user) {
        if (user == null || user.getRole() != Role.SELLER) {
            return new SellerSubscriptionSummary(false, null, null, 0, 0, listingDurationDays);
        }

        boolean active = isActive(user);
        int limit = getLimit(user.getSubscriptionPlan());

        long used = 0;
        if (active) {
            used = listingRepository.countActiveSlots(
                    user.getId(),
                    List.of(
                            ListingState.PUBLISHED,
                            ListingState.RESERVED,
                            ListingState.IN_TRANSACTION,
                            ListingState.AWAITING_WAREHOUSE,
                            ListingState.AT_WAREHOUSE_PENDING_VERIFY
                    ),
                    LocalDateTime.now()
            );
        }

        return new SellerSubscriptionSummary(
                active,
                user.getSubscriptionPlan(),
                user.getSubscriptionExpiresAt() != null ? user.getSubscriptionExpiresAt().toString() : null,
                (int) used,
                active ? limit : 0,
                listingDurationDays
        );
    }

    public boolean isActive(User user) {
        if (user == null || user.getRole() != Role.SELLER) return false;
        if (user.getSubscriptionPlan() == null || user.getSubscriptionExpiresAt() == null) return false;
        return user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now());
    }

    public int getLimit(SubscriptionPlan plan) {
        if (plan == SubscriptionPlan.BASIC) return 7;
        if (plan == SubscriptionPlan.VIP) return 15;
        return 0;
    }

    public void activateSubscription(User user, SubscriptionPlan plan) {
        boolean upgradeBasicToVip =
                isActive(user)
                        && user.getSubscriptionPlan() == SubscriptionPlan.BASIC
                        && plan == SubscriptionPlan.VIP;

        user.setSubscriptionPlan(plan);

        if (!upgradeBasicToVip) {
            user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
        }
    }

    public void clearSubscription(User user) {
        user.setSubscriptionPlan(null);
        user.setSubscriptionExpiresAt(null);
    }
}