package com.biketrading.backend.controller;

import com.biketrading.backend.entity.PackageOrder;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.PackageOrderStatus;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.PackageOrderRepository;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.CurrentUserService;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PackageController {
    private final CurrentUserService currentUserService;
    private final PackageOrderRepository packageOrderRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;

    public PackageController(CurrentUserService currentUserService, PackageOrderRepository packageOrderRepository, UserRepository userRepository, ListingRepository listingRepository) {
        this.currentUserService = currentUserService;
        this.packageOrderRepository = packageOrderRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    @GetMapping("/packages")
    public ResponseEntity<?> listPackages() {
        List<Map<String, Object>> plans = List.of(
                Map.of("id", "BASIC", "name", "Basic", "maxConcurrentListings", 7, "priceVnd", 99000, "description", "7 published slots"),
                Map.of("id", "VIP", "name", "VIP", "maxConcurrentListings", 15, "priceVnd", 199000, "description", "15 published slots")
        );
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("listingDurationDays", 30);
        out.put("paymentProviders", List.of(Map.of("id", "VNPAY", "name", "VNPay", "docsUrl", "", "note", "Demo redirect")));
        out.put("plans", plans);
        out.put("demoCallbackHint", frontendBaseUrl + "/seller/packages?mockPay=");
        return ApiResponse.ok(out);
    }

    @PostMapping("/seller/subscription/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> body) {
        User seller = currentUserService.requireUser();
        String planRaw = body.getOrDefault("plan", "BASIC").toUpperCase();
        SubscriptionPlan plan = SubscriptionPlan.valueOf(planRaw);
        BigDecimal amount = plan == SubscriptionPlan.VIP ? new BigDecimal("199000") : new BigDecimal("99000");
        PackageOrder order = new PackageOrder();
        order.setSeller(seller);
        order.setPlan(plan);
        order.setProvider("VNPAY");
        order.setAmountVnd(amount);
        order.setPaymentUrl(frontendBaseUrl + "/seller/packages?orderId=" + order.getId() + "&status=success");
        packageOrderRepository.save(order);
        order.setPaymentUrl(frontendBaseUrl + "/seller/packages?orderId=" + order.getId() + "&status=success");
        packageOrderRepository.save(order);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("orderId", String.valueOf(order.getId()));
        out.put("plan", plan.name());
        out.put("provider", "VNPAY");
        out.put("amountVnd", amount);
        out.put("paymentUrl", order.getPaymentUrl());
        out.put("demoReturnUrl", order.getPaymentUrl());
        out.put("paymentKind", "MOCK");
        out.put("message", "Demo package checkout");
        return ApiResponse.ok(out);
    }

    @PostMapping("/seller/subscription/orders/{orderId}/mock-complete")
    public ResponseEntity<?> mockComplete(@PathVariable Long orderId) {
        User seller = currentUserService.requireUser();
        PackageOrder order = packageOrderRepository.findById(orderId).orElse(null);
        if (order == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Order not found");
        if (!order.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.FORBIDDEN, "Not your order");
        order.setStatus(PackageOrderStatus.COMPLETED);
        packageOrderRepository.save(order);
        seller.setSubscriptionPlan(order.getPlan());
        seller.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
        seller.setPublishedSlotsLimit(order.getPlan() == SubscriptionPlan.VIP ? 15 : 7);
        userRepository.save(seller);
        long published = listingRepository.countBySellerAndState(seller, com.biketrading.backend.enums.ListingState.PUBLISHED);
        return ApiResponse.ok(Map.of(
                "orderId", String.valueOf(order.getId()),
                "subscription", MapperUtil.sellerSubscription(seller, published)
        ));
    }

    @PutMapping("/seller/subscription/revoke-self")
    public ResponseEntity<?> revokeSelf() {
        User seller = currentUserService.requireUser();
        boolean hadPlan = seller.getSubscriptionPlan() != null && seller.getSubscriptionPlan() != SubscriptionPlan.FREE;
        seller.setSubscriptionPlan(SubscriptionPlan.FREE);
        seller.setSubscriptionExpiresAt(null);
        seller.setPublishedSlotsLimit(0);
        userRepository.save(seller);
        long published = listingRepository.countBySellerAndState(seller, com.biketrading.backend.enums.ListingState.PUBLISHED);
        return ApiResponse.ok(Map.of(
                "subscription", MapperUtil.sellerSubscription(seller, published),
                "revoked", hadPlan
        ));
    }
}
