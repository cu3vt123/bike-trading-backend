package com.minhyun.quydu_be.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Builds signed VNPAY sandbox/prod checkout URLs (same rules as
 * {@code POST /payment/create}). Used by payment API and buyer checkout responses
 * so clients receive a direct {@code paymentUrl} without relying on GET /payment/create.
 */
@Service
public class VnpayUrlService {

    @Value("${vnpay.tmnCode:}")
    private String vnpTmnCode;
    @Value("${vnpay.hashSecret:}")
    private String vnpHashSecret;
    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;
    @Value("${vnpay.returnUrl:http://localhost:8081/payment/vnpay-return}")
    private String vnpReturnUrl;
    @Value("${vnpay.ipnUrl:}")
    private String vnpIpnUrl;
    @Value("${vnpay.bankCode:NCB}")
    private String vnpBankCode;

    /**
     * @param txnRef   e.g. ORDER_123, BALANCE_123, PACKAGE_1
     * @param orderInfo short description shown on VNPAY
     * @param amountVnd whole VND (not multiplied by 100 yet)
     */
    public String buildPaymentUrl(String txnRef, String orderInfo, long amountVnd) {
        if (vnpTmnCode == null || vnpTmnCode.isBlank() || vnpHashSecret == null || vnpHashSecret.isBlank()) {
            throw new IllegalStateException("VNPAY is not configured");
        }
        Map<String, String> vnp = new LinkedHashMap<>();
        vnp.put("vnp_Version", "2.1.0");
        vnp.put("vnp_Command", "pay");
        vnp.put("vnp_TmnCode", vnpTmnCode);
        vnp.put("vnp_Locale", "vn");
        vnp.put("vnp_CurrCode", "VND");
        vnp.put("vnp_TxnRef", txnRef);
        vnp.put("vnp_OrderInfo", orderInfo);
        vnp.put("vnp_OrderType", "other");
        vnp.put("vnp_Amount", String.valueOf(Math.round(amountVnd) * 100));
        vnp.put("vnp_ReturnUrl", vnpReturnUrl);
        vnp.put("vnp_IpAddr", "127.0.0.1");
        vnp.put(
            "vnp_CreateDate",
            LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
        );
        if (vnpIpnUrl != null && !vnpIpnUrl.isBlank()) {
            vnp.put("vnp_IpnUrl", vnpIpnUrl);
        }
        if (vnpBankCode != null && !vnpBankCode.isBlank()) {
            vnp.put("vnp_BankCode", vnpBankCode);
        }
        var keys = new ArrayList<>(vnp.keySet());
        keys.sort(Comparator.naturalOrder());
        StringBuilder query = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            if (i > 0) {
                query.append("&");
            }
            query.append(encode(k)).append("=").append(encode(vnp.get(k)));
        }
        String secureHash = hmacSha512(vnpHashSecret, query.toString());
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign VNPAY request", e);
        }
    }
}
