package com.biketrading.backend.util;

import com.biketrading.backend.entity.*;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.SubscriptionPlan;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

public class MapperUtil {
    public static final int LISTING_DURATION_DAYS = 30;

    public static Map<String, Object> sellerSubscription(User user, long publishedCount) {
        boolean active = user.getSubscriptionPlan() != null
                && user.getSubscriptionPlan() != SubscriptionPlan.FREE
                && user.getSubscriptionExpiresAt() != null
                && user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("active", active);
        out.put("plan", active ? user.getSubscriptionPlan().name() : null);
        out.put("expiresAt", active ? user.getSubscriptionExpiresAt().toString() : null);
        out.put("publishedSlotsUsed", publishedCount);
        out.put("publishedSlotsLimit", active ? (user.getPublishedSlotsLimit() == null ? 0 : user.getPublishedSlotsLimit()) : 0);
        out.put("listingDurationDays", LISTING_DURATION_DAYS);
        return out;
    }

    public static Map<String, Object> userDto(User u, long publishedCount) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(u.getId()));
        out.put("username", u.getUsername());
        out.put("email", u.getEmail());
        out.put("displayName", u.getDisplayName());
        out.put("role", u.getRole().name());
        out.put("isHidden", Boolean.TRUE.equals(u.getIsHidden()));
        out.put("hiddenAt", u.getHiddenAt() != null ? u.getHiddenAt().toString() : null);
        out.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        out.put("updatedAt", u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null);
        out.put("subscription", sellerSubscription(u, publishedCount));
        return out;
    }

    public static Map<String, Object> brandDto(Brand b) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(b.getId()));
        out.put("name", b.getName());
        out.put("slug", b.getSlug());
        out.put("active", Boolean.TRUE.equals(b.getActive()));
        return out;
    }

    public static Map<String, Object> listingDto(Listing l) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(l.getId()));
        out.put("title", l.getTitle());
        out.put("brand", l.getBrand());
        out.put("model", l.getModel());
        out.put("year", l.getYear());
        out.put("frameSize", l.getFrameSize());
        out.put("condition", l.getCondition() != null ? l.getCondition().name() : null);
        out.put("price", safeNum(l.getPrice()));
        out.put("msrp", safeNum(l.getMsrp()));
        out.put("currency", l.getCurrency());
        out.put("location", l.getLocation());
        out.put("description", l.getDescription());
        out.put("thumbnailUrl", l.getThumbnailUrl());
        out.put("imageUrls", l.getImageUrls() == null ? List.of() : l.getImageUrls());
        out.put("state", l.getState() != null ? l.getState().name() : ListingState.DRAFT.name());
        out.put("inspectionResult", l.getInspectionResult() != null ? l.getInspectionResult().name() : null);
        out.put("inspectionScore", l.getInspectionScore());
        out.put("inspectionNeedUpdateReason", l.getInspectionNeedUpdateReason());
        out.put("certificationStatus", l.getCertificationStatus() != null ? l.getCertificationStatus().name() : null);
        out.put("sellerShippedToWarehouseAt", l.getSellerShippedToWarehouseAt() != null ? l.getSellerShippedToWarehouseAt().toString() : null);
        out.put("warehouseIntakeVerifiedAt", l.getWarehouseIntakeVerifiedAt() != null ? l.getWarehouseIntakeVerifiedAt().toString() : null);
        out.put("publishedAt", l.getPublishedAt() != null ? l.getPublishedAt().toString() : null);
        out.put("listingExpiresAt", l.getListingExpiresAt() != null ? l.getListingExpiresAt().toString() : null);
        out.put("isHidden", Boolean.TRUE.equals(l.getIsHidden()));
        out.put("hiddenAt", l.getHiddenAt() != null ? l.getHiddenAt().toString() : null);
        if (l.getSeller() != null) {
            Map<String, Object> seller = new LinkedHashMap<>();
            seller.put("id", String.valueOf(l.getSeller().getId()));
            seller.put("name", l.getSeller().getDisplayName());
            seller.put("email", l.getSeller().getEmail());
            out.put("seller", seller);
        }
        return out;
    }

    public static Map<String, Object> orderDto(Order o) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(o.getId()));
        out.put("listingId", String.valueOf(o.getListing().getId()));
        out.put("buyerId", String.valueOf(o.getBuyer().getId()));
        out.put("sellerId", o.getListing() != null && o.getListing().getSeller() != null ? String.valueOf(o.getListing().getSeller().getId()) : null);
        out.put("status", o.getStatus().name());
        out.put("fulfillmentType", o.getFulfillmentType().name());
        out.put("plan", o.getPlan());
        out.put("totalPrice", safeNum(o.getTotalPrice()));
        out.put("depositAmount", safeNum(o.getDepositAmount()));
        out.put("depositPaid", Boolean.TRUE.equals(o.getDepositPaid()));
        out.put("balancePaid", Boolean.TRUE.equals(o.getBalancePaid()));
        out.put("vnpayPaymentStatus", o.getVnpayPaymentStatus());
        out.put("vnpayAmountVnd", safeNum(o.getVnpayAmountVnd()));
        Map<String, Object> shipping = new LinkedHashMap<>();
        shipping.put("street", o.getShippingStreet());
        shipping.put("city", o.getShippingCity());
        shipping.put("postalCode", o.getShippingPostalCode());
        out.put("shippingAddress", shipping);
        out.put("shippedAt", o.getShippedAt() != null ? o.getShippedAt().toString() : null);
        out.put("warehouseConfirmedAt", o.getWarehouseConfirmedAt() != null ? o.getWarehouseConfirmedAt().toString() : null);
        out.put("reInspectionDoneAt", o.getReInspectionDoneAt() != null ? o.getReInspectionDoneAt().toString() : null);
        out.put("expiresAt", o.getExpiresAt() != null ? o.getExpiresAt().toString() : null);
        out.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
        out.put("updatedAt", o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : null);
        out.put("listing", listingDto(o.getListing()));
        return out;
    }

    public static Map<String, Object> reviewDto(Review r) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(r.getId()));
        out.put("orderId", String.valueOf(r.getOrder().getId()));
        out.put("listingId", String.valueOf(r.getListing().getId()));
        out.put("sellerId", String.valueOf(r.getSeller().getId()));
        out.put("buyerId", String.valueOf(r.getBuyer().getId()));
        out.put("rating", r.getRating());
        out.put("comment", r.getComment());
        out.put("status", r.getStatus().name());
        out.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        out.put("updatedAt", r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null);
        return out;
    }

    public static Map<String, Object> packageOrderDto(PackageOrder o) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", String.valueOf(o.getId()));
        out.put("sellerId", String.valueOf(o.getSeller().getId()));
        out.put("plan", o.getPlan().name());
        out.put("provider", o.getProvider());
        out.put("amountVnd", safeNum(o.getAmountVnd()));
        out.put("status", o.getStatus().name());
        out.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
        return out;
    }

    private static Number safeNum(BigDecimal v) {
        return v == null ? null : v.stripTrailingZeros();
    }
}
