package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ApiResponse;
import com.biketrading.backend.dto.SellerSubscriptionSummary;
import com.biketrading.backend.entity.PackageOrder;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.PaymentStatus;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.exception.BadRequestException;
import com.biketrading.backend.exception.UnauthorizedException;
import com.biketrading.backend.repository.PackageOrderRepository;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.security.UserPrincipal;
import com.biketrading.backend.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PackageController {

    private final PackageOrderRepository packageOrderRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;

    @GetMapping("/packages")
    public ApiResponse<Map<String, Object>> getCatalog(HttpServletRequest request) {
        String origin = resolveOrigin(request);

        List<Map<String, Object>> plans = List.of(
                Map.of(
                        "id", "BASIC",
                        "name", "Basic",
                        "maxConcurrentListings", 7,
                        "priceVnd", 99000,
                        "description", "Đăng tối đa 7 tin hoạt động cùng lúc trong 30 ngày"
                ),
                Map.of(
                        "id", "VIP",
                        "name", "VIP",
                        "maxConcurrentListings", 15,
                        "priceVnd", 199000,
                        "description", "Đăng tối đa 15 tin hoạt động cùng lúc trong 30 ngày"
                )
        );

        return ApiResponse.of(Map.of(
                "listingDurationDays", 30,
                "paymentProviders", List.of(
                        Map.of(
                                "id", "VNPAY",
                                "name", "VNPay",
                                "docsUrl", "",
                                "note", "Demo mock payment trước khi nối VNPay thật"
                        )
                ),
                "plans", plans,
                "demoCallbackHint", origin + "/seller/packages?mockPay="
        ));
    }

    @PostMapping("/seller/subscription/checkout")
    public ApiResponse<Map<String, Object>> checkout(@RequestBody Map<String, String> body,
                                                     Authentication authentication,
                                                     HttpServletRequest request) {
        User seller = getCurrentSeller(authentication);

        String planRaw = body.get("plan");
        String provider = body.getOrDefault("provider", "VNPAY");

        if (planRaw == null || planRaw.isBlank()) {
            throw new BadRequestException("Plan is required");
        }

        SubscriptionPlan plan = SubscriptionPlan.valueOf(planRaw.toUpperCase());

        boolean hasActive = subscriptionService.isActive(seller);
        SubscriptionPlan currentPlan = seller.getSubscriptionPlan();

        if (hasActive && currentPlan == SubscriptionPlan.VIP && plan == SubscriptionPlan.BASIC) {
            throw new BadRequestException("Không thể hạ từ VIP xuống BASIC.");
        }

        if (hasActive && currentPlan == plan) {
            throw new BadRequestException("Gói hiện tại vẫn còn hạn.");
        }

        long amountVnd;
        boolean isUpgrade = false;

        if (hasActive && currentPlan == SubscriptionPlan.BASIC && plan == SubscriptionPlan.VIP) {
            amountVnd = 100000;
            isUpgrade = true;
        } else {
            amountVnd = (plan == SubscriptionPlan.VIP) ? 199000 : 99000;
        }

        String origin = resolveOrigin(request);

        PackageOrder order = new PackageOrder();
        order.setSeller(seller);
        order.setPlan(plan);
        order.setProvider(provider);
        order.setAmountVnd(BigDecimal.valueOf(amountVnd));
        order.setStatus(PaymentStatus.PENDING);

        packageOrderRepository.save(order);

        String paymentUrl = origin + "/seller/packages?orderId=" + order.getId() + "&provider=" + provider + "&step=pay";
        String demoReturnUrl = origin + "/seller/packages?orderId=" + order.getId() + "&status=success";

        order.setPaymentUrl(paymentUrl);
        packageOrderRepository.save(order);

        return ApiResponse.of(Map.of(
                "orderId", String.valueOf(order.getId()),
                "plan", plan.name(),
                "provider", provider,
                "amountVnd", amountVnd,
                "isUpgrade", isUpgrade,
                "paymentUrl", paymentUrl,
                "qrContent", paymentUrl,
                "demoReturnUrl", demoReturnUrl,
                "paymentKind", "MOCK",
                "message", "Demo mock payment trên cùng origin"
        ));
    }

    @PostMapping("/seller/subscription/orders/{orderId}/mock-complete")
    public ApiResponse<Map<String, Object>> mockComplete(@PathVariable Long orderId,
                                                         Authentication authentication) {
        User seller = getCurrentSeller(authentication);

        PackageOrder order = packageOrderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new UnauthorizedException("Not your order");
        }

        if (order.getStatus() != PaymentStatus.COMPLETED) {
            order.setStatus(PaymentStatus.COMPLETED);
            packageOrderRepository.save(order);

            subscriptionService.activateSubscription(seller, order.getPlan());
            userRepository.save(seller);
        }

        SellerSubscriptionSummary summary = subscriptionService.buildSummary(seller);

        return ApiResponse.of(Map.of(
                "orderId", String.valueOf(order.getId()),
                "subscription", summary
        ));
    }

    @PutMapping("/seller/subscription/revoke-self")
    public ApiResponse<Map<String, Object>> revokeSelf(Authentication authentication) {
        User seller = getCurrentSeller(authentication);
        boolean hadPlan = seller.getSubscriptionPlan() != null || seller.getSubscriptionExpiresAt() != null;

        if (hadPlan) {
            subscriptionService.clearSubscription(seller);
            userRepository.save(seller);
        }

        SellerSubscriptionSummary summary = subscriptionService.buildSummary(seller);

        return ApiResponse.of(Map.of(
                "subscription", summary,
                "revoked", hadPlan
        ));
    }

    private User getCurrentSeller(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("Unauthorized");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getRole() != Role.SELLER) {
            throw new UnauthorizedException("Seller only");
        }

        return user;
    }

    private String resolveOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank()) {
            return origin.replaceAll("/$", "");
        }

        String referer = request.getHeader("Referer");
        if (referer != null && referer.startsWith("http")) {
            int idx = referer.indexOf("/", referer.indexOf("//") + 2);
            return idx > 0 ? referer.substring(0, idx) : referer;
        }

        return frontendBaseUrl;
    }
}