package com.biketrading.backend.controller;

import com.biketrading.backend.config.VNPayConfig;
import com.biketrading.backend.dto.PackageBuyRequest;
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

import jakarta.servlet.http.HttpServletRequest;
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

    // 1. API: Seller bấm mua gói -> Trả về Link quét mã QR
    @PostMapping("/seller/buy-package")
    public ResponseEntity<?> createPaymentUrl(@RequestBody PackageBuyRequest request, HttpServletRequest httpRequest) throws Exception {
        User seller = getCurrentUser();
        SubscriptionPlan plan = SubscriptionPlan.valueOf(request.getPlan().toUpperCase());

        // Định giá và số lượng tin (Giả lập)
        long amount = 0;
        if (plan == SubscriptionPlan.BASIC) amount = 50000; // 50k VNĐ
        else if (plan == SubscriptionPlan.VIP) amount = 150000; // 150k VNĐ
        else if (plan == SubscriptionPlan.INSPECTION) amount = 200000; // 200k VNĐ

        if (amount == 0) return ResponseEntity.badRequest().body("Gói không hợp lệ!");

        // Tạo hóa đơn trong Database (Trạng thái PENDING)
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        PackageOrder order = new PackageOrder();
        order.setUser(seller);
        order.setPlan(plan);
        order.setAmount(BigDecimal.valueOf(amount));
        order.setTxnRef(vnp_TxnRef);
        packageOrderRepository.save(order);

        // --- TẠO URL VNPAY ---
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay yêu cầu nhân 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan goi " + plan + " cho user " + seller.getUsername());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15); // Link QR sống 15 phút
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // Build chuỗi hash
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + query.toString();

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    // 2. API: Webhook/Return nhận kết quả từ VNPay và CỘNG LƯỢT ĐĂNG TIN
    @GetMapping("/vnpay/return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        Optional<PackageOrder> orderOpt = packageOrderRepository.findByTxnRef(txnRef);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body("Không tìm thấy giao dịch!");

        PackageOrder order = orderOpt.get();

        if ("00".equals(vnp_ResponseCode)) { // 00 = Thanh toán thành công
            if(order.getStatus() == PaymentStatus.PENDING) {
                order.setStatus(PaymentStatus.SUCCESS);
                order.setPaidAt(LocalDateTime.now());
                packageOrderRepository.save(order);

                // CỘNG TIN CHO SELLER
                User seller = order.getUser();
                if (order.getPlan() == SubscriptionPlan.BASIC) {
                    seller.setRemainingListings(seller.getRemainingListings() + 7);
                    seller.setCurrentPlan(SubscriptionPlan.BASIC);
                } else if (order.getPlan() == SubscriptionPlan.VIP) {
                    seller.setRemainingListings(seller.getRemainingListings() + 15);
                    seller.setCurrentPlan(SubscriptionPlan.VIP);
                }
                userRepository.save(seller);
            }
            return ResponseEntity.ok("<h1>THANH TOÁN THÀNH CÔNG! Đã cộng lượt đăng tin vào tài khoản.</h1> <a href='http://localhost:5173/seller-dashboard'>Quay lại Dashboard</a>");
        } else {
            order.setStatus(PaymentStatus.FAILED);
            packageOrderRepository.save(order);
            return ResponseEntity.badRequest().body("<h1>THANH TOÁN THẤT BẠI HOẶC BỊ HỦY!</h1> <a href='http://localhost:5173/seller-dashboard'>Quay lại Dashboard</a>");
        }
    }
}