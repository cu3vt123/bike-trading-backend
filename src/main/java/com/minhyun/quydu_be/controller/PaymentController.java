package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderStatus;
import com.minhyun.quydu_be.entity.PackageOrder;
import com.minhyun.quydu_be.entity.PackageOrderStatus;
import com.minhyun.quydu_be.entity.SubscriptionPlan;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.entity.VnpayPaymentStatus;
import com.minhyun.quydu_be.repository.OrderRepository;
import com.minhyun.quydu_be.repository.PackageOrderRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PackageOrderRepository packageOrderRepository;
    private final UserRepository userRepository;

    public PaymentController(
        OrderRepository orderRepository,
        PackageOrderRepository packageOrderRepository,
        UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.packageOrderRepository = packageOrderRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody(required = false) Map<String, Object> request) {
        Object orderId = request == null ? null : request.get("orderId");
        String url = "http://localhost:8081/payment/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=ORDER_" + (orderId == null ? "" : orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Created payment", Map.of("paymentUrl", url)));
    }

    @RequestMapping(value = "/create", method = RequestMethod.GET)
    public ResponseEntity<Void> createByGet(
        @RequestParam(name = "orderId", required = false) Long orderId,
        @RequestParam(name = "kind", required = false) String kind
    ) {
        String prefix = "BALANCE".equalsIgnoreCase(kind) ? "BALANCE_" : "ORDER_";
        String url = "http://localhost:8081/payment/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=" + prefix + (orderId == null ? "" : orderId);
        return ResponseEntity.status(302).header(HttpHeaders.LOCATION, url).build();
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(
        @RequestParam(name = "vnp_ResponseCode", required = false) String responseCode,
        @RequestParam(name = "vnp_TxnRef", required = false) String txnRef
    ) {
        boolean success = "00".equals(responseCode);
        boolean applied = false;
        if (success) {
            applied = processTxnRef(txnRef);
        }
        if (txnRef != null && txnRef.startsWith("PACKAGE_")) {
            String sellerRedirect = "http://localhost:5173/seller/packages?vnpay=1&ok=" + (success && applied ? "1" : "0");
            return ResponseEntity.status(302).header(HttpHeaders.LOCATION, sellerRedirect).build();
        }
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "Processed return",
            Map.of("success", success && applied, "txnRef", txnRef, "responseCode", responseCode)
        ));
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(
        @RequestParam(name = "vnp_ResponseCode", required = false) String responseCode,
        @RequestParam(name = "vnp_TxnRef", required = false) String txnRef
    ) {
        if ("00".equals(responseCode)) {
            processTxnRef(txnRef);
        }
        return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
    }

    private boolean processTxnRef(String txnRef) {
        if (txnRef == null || txnRef.isBlank()) return false;
        try {
            if (txnRef.startsWith("ORDER_")) {
                Long orderId = extractNumericId(txnRef.substring("ORDER_".length()));
                if (orderId == null) return false;
                return orderRepository.findById(orderId).map(o -> {
                    markDepositPaid(o);
                    return true;
                }).orElse(false);
            } else if (txnRef.startsWith("BALANCE_")) {
                Long orderId = extractNumericId(txnRef.substring("BALANCE_".length()));
                if (orderId == null) return false;
                return orderRepository.findById(orderId).map(o -> {
                    markBalancePaid(o);
                    return true;
                }).orElse(false);
            } else if (txnRef.startsWith("PACKAGE_")) {
                Long packageOrderId = extractNumericId(txnRef.substring("PACKAGE_".length()));
                if (packageOrderId == null) return false;
                return packageOrderRepository.findById(packageOrderId).map(p -> {
                    markPackagePaid(p);
                    return true;
                }).orElse(false);
            }
            return false;
        } catch (Exception ignored) {
            // Keep endpoint resilient for sandbox callbacks.
            return false;
        }
    }

    private Long extractNumericId(String raw) {
        if (raw == null || raw.isBlank()) return null;
        StringBuilder digits = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (Character.isDigit(c)) {
                digits.append(c);
            } else {
                break;
            }
        }
        if (digits.isEmpty()) return null;
        try {
            return Long.parseLong(digits.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void markDepositPaid(Order order) {
        order.setDepositPaid(true);
        order.setVnpayPaymentStatus(VnpayPaymentStatus.PAID);
        if (order.getStatus() == OrderStatus.RESERVED) {
            order.setStatus(OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
        }
        orderRepository.save(order);
    }

    private void markBalancePaid(Order order) {
        order.setBalancePaid(true);
        order.setVnpayPaymentStatus(VnpayPaymentStatus.PAID);
        orderRepository.save(order);
    }

    private void markPackagePaid(PackageOrder packageOrder) {
        packageOrder.setStatus(PackageOrderStatus.COMPLETED);
        packageOrderRepository.save(packageOrder);

        User seller = packageOrder.getSeller();
        SubscriptionPlan plan = packageOrder.getPlan();
        seller.setSubscriptionPlan(plan);
        seller.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
        userRepository.save(seller);
    }
}
