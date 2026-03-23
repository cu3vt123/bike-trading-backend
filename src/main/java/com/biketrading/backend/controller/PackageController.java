package com.biketrading.backend.controller;

import com.biketrading.backend.config.VNPayConfig;
import com.biketrading.backend.entity.PackageOrder;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.PaymentStatus;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.PackageOrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PackageController {

    @Autowired private VNPayConfig vnPayConfig;
    @Autowired private UserRepository userRepository;
    @Autowired private PackageOrderRepository packageOrderRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    // 1. API GET Catalog các gói cước (FE: packagesApi.getCatalog)
    @GetMapping("/packages")
    public ResponseEntity<?> getPackages() {
        List<Map<String, Object>> plans = List.of(
                Map.of("id", "BASIC", "name", "Gói Cơ Bản", "maxConcurrentListings", 7, "priceVnd", 50000, "description", "Đăng 7 tin / tuần"),
                Map.of("id", "VIP", "name", "Gói VIP", "maxConcurrentListings", 15, "priceVnd", 150000, "description", "Đăng 15 tin / tuần"),
                Map.of("id", "INSPECTION", "name", "Gói Kiểm Định", "maxConcurrentListings", 0, "priceVnd", 200000, "description", "1 Lượt kiểm định xe")
        );

        return ResponseEntity.ok(Map.of(
                "listingDurationDays", 7,
                "paymentProviders", List.of(Map.of("id", "VNPAY", "name", "VNPay", "docsUrl", "", "note", "Thanh toán QR")),
                "plans", plans
        ));
    }

    // 2. API Checkout mua gói (FE: packagesApi.checkout)
    @PostMapping({"/seller/subscription/checkout", "/seller/buy-package"})
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> request) throws Exception {
        User seller = getCurrentUser();
        SubscriptionPlan plan = SubscriptionPlan.valueOf(request.get("plan").toUpperCase());

        long amount = plan == SubscriptionPlan.BASIC ? 50000 : (plan == SubscriptionPlan.VIP ? 150000 : 200000);

        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        PackageOrder order = new PackageOrder();
        order.setUser(seller);
        order.setPlan(plan);
        order.setAmount(BigDecimal.valueOf(amount));
        order.setTxnRef(vnp_TxnRef);
        packageOrderRepository.save(order);

        // Tạo URL VNPay
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
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
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString())).append('&');
                hashData.append('&');
            }
        }
        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + query.toString();

        // Trả đúng format SubscriptionCheckoutResponse FE cần
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
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        Optional<PackageOrder> orderOpt = packageOrderRepository.findByTxnRef(txnRef);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body("Không tìm thấy giao dịch!");

        PackageOrder order = orderOpt.get();
        if ("00".equals(vnp_ResponseCode) && order.getStatus() == PaymentStatus.PENDING) {
            order.setStatus(PaymentStatus.SUCCESS);
            order.setPaidAt(LocalDateTime.now());
            packageOrderRepository.save(order);

            User seller = order.getUser();
            if (order.getPlan() == SubscriptionPlan.BASIC) {
                seller.setRemainingListings(seller.getRemainingListings() + 7);
                seller.setCurrentPlan(SubscriptionPlan.BASIC);
                seller.setPackageExpiryDate(LocalDateTime.now().plusWeeks(1));
            } else if (order.getPlan() == SubscriptionPlan.VIP) {
                seller.setRemainingListings(seller.getRemainingListings() + 15);
                seller.setCurrentPlan(SubscriptionPlan.VIP);
                seller.setPackageExpiryDate(LocalDateTime.now().plusWeeks(1));
            } else if (order.getPlan() == SubscriptionPlan.INSPECTION) {
                seller.setInspectionCredits(seller.getInspectionCredits() + 1);
            }
            userRepository.save(seller);
        }
        return ResponseEntity.status(302).header("Location", "http://localhost:5173/seller-dashboard").build();
    }
}