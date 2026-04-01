package com.bob.planb.controller;

import com.bob.planb.entity.*;
import com.bob.planb.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        String responseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");

        if ("00".equals(responseCode)) {
            // TRƯỜNG HỢP 1: MUA GÓI HỘI VIÊN
            if (vnp_TxnRef.startsWith("PKG-")) {
                String[] parts = vnp_TxnRef.split("-");
                Long pkgId = Long.parseLong(parts[2]);
                Long userId = Long.parseLong(parts[3]);

                User user = userRepository.findById(userId).orElseThrow();
                SubscriptionPackage pkg = packageRepository.findById(pkgId).orElseThrow();

                // Cộng quyền lợi vào User
                user.setTotalPostAllowed(user.getTotalPostAllowed() + pkg.getLimitPost());
                user.setPackageExpiresAt(LocalDateTime.now().plusDays(pkg.getDurationDays()));
                userRepository.save(user);

                return ResponseEntity.ok(Map.of("status", "success", "message", "Nâng cấp gói thành công"));
            }
            // TRƯỜNG HỢP 2: MUA XE
            else if (vnp_TxnRef.startsWith("ORD-")) {
                Order order = orderRepository.findByOrderCode(vnp_TxnRef).orElseThrow();
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);

                Listing listing = listingRepository.findById(order.getListingId()).orElseThrow();
                listing.setState(ListingState.IN_TRANSACTION);
                listingRepository.save(listing);

                return ResponseEntity.ok(Map.of("status", "success", "message", "Thanh toán đơn hàng thành công"));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Giao dịch không thành công"));
    }
}