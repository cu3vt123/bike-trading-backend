package com.bob.planb.controller;

import com.bob.planb.config.VNPayConfig;
import com.bob.planb.entity.SubscriptionPackage;
import com.bob.planb.repository.PackageRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageRepository packageRepository;

    @Value("${vnpay.tmnCode}") private String vnp_TmnCode;
    @Value("${vnpay.hashSecret}") private String vnp_HashSecret;
    @Value("${vnpay.url}") private String vnp_PayUrl;
    @Value("${vnpay.returnUrl}") private String vnp_ReturnUrl;

    @GetMapping
    public ResponseEntity<?> getAllPackages() {
        return ResponseEntity.ok(Map.of("data", packageRepository.findAll()));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable Long id, HttpServletRequest request) throws Exception {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        SubscriptionPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gói không tồn tại"));

        // Format vnp_TxnRef: PKG-{Random}-{PkgID}-{UserID}
        String vnp_TxnRef = "PKG-" + VNPayConfig.getRandomNumber(6) + "-" + id + "-" + userId;
        long amount = (long) (pkg.getPrice() * 100);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan goi " + pkg.getName());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                hashData.append('&');
                query.append('&');
            }
        }
        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
        String paymentUrl = vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }
}