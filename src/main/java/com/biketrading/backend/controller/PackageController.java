package com.biketrading.backend.controller;

import com.biketrading.backend.config.VNPayConfig;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.PackageOrder;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.PaymentStatus;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.PackageOrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PackageController {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackageOrderRepository packageOrderRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    private String frontendBase() {
        return "http://localhost:5173";
    }

    private void activateSubscription(User seller, SubscriptionPlan plan) {
        if (plan == SubscriptionPlan.BASIC) {
            seller.setRemainingListings(seller.getRemainingListings() + 7);
            seller.setCurrentPlan(SubscriptionPlan.BASIC);
            seller.setPackageExpiryDate(LocalDateTime.now().plusWeeks(1));
        } else if (plan == SubscriptionPlan.VIP) {
            seller.setRemainingListings(seller.getRemainingListings() + 15);
            seller.setCurrentPlan(SubscriptionPlan.VIP);
            seller.setPackageExpiryDate(LocalDateTime.now().plusWeeks(1));
        } else if (plan == SubscriptionPlan.INSPECTION) {
            seller.setInspectionCredits(seller.getInspectionCredits() + 1);
        }
        userRepository.save(seller);
    }

    @GetMapping("/packages")
    public ResponseEntity<?> getPackages() {
        List<Map<String, Object>> plans = List.of(
                Map.of(
                        "id", "BASIC",
                        "name", "Gói Cơ Bản",
                        "maxConcurrentListings", 7,
                        "priceVnd", 50000,
                        "description", "Đăng 7 tin / tuần"
                ),
                Map.of(
                        "id", "VIP",
                        "name", "Gói VIP",
                        "maxConcurrentListings", 15,
                        "priceVnd", 150000,
                        "description", "Đăng 15 tin / tuần"
                ),
                Map.of(
                        "id", "INSPECTION",
                        "name", "Gói Kiểm Định",
                        "maxConcurrentListings", 0,
                        "priceVnd", 200000,
                        "description", "1 lượt kiểm định xe"
                )
        );

        return ResponseEntity.ok(Map.of(
                "listingDurationDays", 7,
                "paymentProviders", List.of(
                        Map.of(
                                "id", "VNPAY",
                                "name", "VNPay",
                                "docsUrl", "",
                                "note", "Thanh toán QR"
                        )
                ),
                "plans", plans
        ));
    }

    @PostMapping({"/seller/subscription/checkout", "/seller/buy-package"})
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> request) throws Exception {
        User seller = getCurrentUser();

        SubscriptionPlan plan = SubscriptionPlan.valueOf(request.get("plan").toUpperCase());
        long amount = plan == SubscriptionPlan.BASIC ? 50000L
                : (plan == SubscriptionPlan.VIP ? 150000L : 200000L);

        String txnRef = VNPayConfig.getRandomNumber(8);

        PackageOrder order = new PackageOrder();
        order.setUser(seller);
        order.setPlan(plan);
        order.setAmount(BigDecimal.valueOf(amount));
        order.setTxnRef(txnRef);
        packageOrderRepository.save(order);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan goi " + plan);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()))
                        .append('&');
                hashData.append('&');
            }
        }

        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + query;

        return ResponseEntity.ok(Map.of(
                "orderId", String.valueOf(order.getId()),
                "plan", plan.toString(),
                "provider", "VNPAY",
                "amountVnd", amount,
                "paymentUrl", paymentUrl,
                "demoReturnUrl", vnPayConfig.vnp_ReturnUrl,
                "paymentKind", "VNPAY_SANDBOX"
        ));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String txnStatus = params.getOrDefault("vnp_TransactionStatus", "");
        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        boolean success = "00".equals(responseCode) && ("00".equals(txnStatus) || txnStatus.isBlank());

        Optional<PackageOrder> packageOrderOpt = packageOrderRepository.findByTxnRef(txnRef);
        if (packageOrderOpt.isPresent()) {
            PackageOrder order = packageOrderOpt.get();

            if (success && order.getStatus() == PaymentStatus.PENDING) {
                order.setStatus(PaymentStatus.SUCCESS);
                order.setPaidAt(LocalDateTime.now());
                packageOrderRepository.save(order);
                activateSubscription(order.getUser(), order.getPlan());
            }

            String location = UriComponentsBuilder
                    .fromUriString(frontendBase() + "/seller/packages")
                    .queryParam("vnpay", "1")
                    .queryParam("ok", success ? "1" : "0")
                    .queryParam("orderId", order.getId())
                    .queryParam("vnp_ResponseCode", responseCode)
                    .queryParam("vnp_TransactionStatus", txnStatus)
                    .toUriString();

            return ResponseEntity.status(302).header("Location", location).build();
        }

        Optional<Order> buyerOrderOpt = Optional.empty();

        if (txnRef.startsWith("B")) {
            try {
                Long orderId = Long.parseLong(txnRef.substring(1));
                buyerOrderOpt = orderRepository.findById(orderId);
            } catch (Exception ignored) {
            }
        }

        if (buyerOrderOpt.isEmpty()) {
            buyerOrderOpt = orderRepository.findByVnpayTxnRef(txnRef);
        }

        if (buyerOrderOpt.isPresent()) {
            Order order = buyerOrderOpt.get();

            if (success && !"PAID".equalsIgnoreCase(order.getVnpayPaymentStatus())) {
                order.setDepositPaid(true);
                order.setVnpayPaymentStatus("PAID");
                orderRepository.save(order);
            } else if (!success) {
                order.setVnpayPaymentStatus("FAILED");
                orderRepository.save(order);
            }

            String listingId = order.getListing() != null ? String.valueOf(order.getListing().getId()) : "";

            String location = UriComponentsBuilder
                    .fromUriString(frontendBase() + "/payment/vnpay-result")
                    .queryParam("gate", "buyer")
                    .queryParam("ok", success ? "1" : "0")
                    .queryParam("orderId", order.getId())
                    .queryParam("listingId", listingId)
                    .queryParam("orderCode", txnRef)
                    .queryParam("vnp_ResponseCode", responseCode)
                    .queryParam("vnp_TransactionStatus", txnStatus)
                    .toUriString();

            return ResponseEntity.status(302).header("Location", location).build();
        }

        String fallback = UriComponentsBuilder
                .fromUriString(frontendBase() + "/payment/vnpay-result")
                .queryParam("gate", "return")
                .queryParam("ok", success ? "1" : "0")
                .queryParam("orderCode", txnRef)
                .queryParam("vnp_ResponseCode", responseCode)
                .queryParam("vnp_TransactionStatus", txnStatus)
                .toUriString();

        return ResponseEntity.status(302).header("Location", fallback).build();
    }
}