package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.web.RestResponses;
import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderFulfillmentType;
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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PackageOrderRepository packageOrderRepository;
    private final UserRepository userRepository;
    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;
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
    public ResponseEntity<Map<String, Object>> create(@RequestBody(required = false) Map<String, Object> request) {
        if (request == null || request.get("orderId") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "orderId is required for payment amount"));
        }
        Long orderId;
        try {
            orderId = Long.valueOf(String.valueOf(request.get("orderId")));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "invalid orderId"));
        }
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "order not found"));
        }
        String txnRef = "ORDER_" + orderId;
        BigDecimal amountBd = order.getVnpayAmountVnd() != null ? order.getVnpayAmountVnd() : order.getTotalPrice();
        long amountVnd = amountBd.setScale(0, RoundingMode.HALF_UP).longValue();
        if (amountVnd <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "invalid payment amount"));
        }
        String url = buildVnpaySandboxPaymentUrl(txnRef, "ShopBike order " + orderId, amountVnd);
        return RestResponses.okData(Map.of("paymentUrl", url));
    }

    @RequestMapping(value = "/create", method = RequestMethod.GET)
    public ResponseEntity<Void> createByGet(
        @RequestParam(name = "orderId", required = false) Long orderId,
        @RequestParam(name = "kind", required = false) String kind
    ) {
        if (orderId == null) {
            return ResponseEntity.badRequest().build();
        }
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean isBalance = "BALANCE".equalsIgnoreCase(kind);
        String txnRef = (isBalance ? "BALANCE_" : "ORDER_") + orderId;
        long amountVnd;
        if (isBalance) {
            BigDecimal deposit = order.getDepositAmount() == null ? BigDecimal.ZERO : order.getDepositAmount();
            BigDecimal balance = order.getTotalPrice().subtract(deposit).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);
            amountVnd = balance.longValue();
        } else {
            BigDecimal amount = order.getVnpayAmountVnd() == null ? order.getTotalPrice() : order.getVnpayAmountVnd();
            amountVnd = amount.setScale(0, RoundingMode.HALF_UP).longValue();
        }
        String orderInfo = isBalance ? ("ShopBike balance " + orderId) : ("ShopBike order " + orderId);
        String url = buildVnpaySandboxPaymentUrl(txnRef, orderInfo, amountVnd);
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
        if (txnRef != null && txnRef.startsWith("BALANCE_")) {
            Long orderId = extractNumericId(txnRef.substring("BALANCE_".length()));
            String listingId = "";
            String orderIdText = "";
            if (orderId != null) {
                orderIdText = String.valueOf(orderId);
                listingId = orderRepository.findById(orderId).map(o -> String.valueOf(o.getListing().getId())).orElse("");
            }
            String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/+$", "");
            String url = base
                + "/finalize/" + encode(listingId)
                + "?orderId=" + encode(orderIdText)
                + "&vnpay_balance=" + ((success && applied) ? "1" : "0");
            return ResponseEntity.status(302).header(HttpHeaders.LOCATION, url).build();
        }
        Long orderId = null;
        if (txnRef != null) {
            if (txnRef.startsWith("ORDER_")) {
                orderId = extractNumericId(txnRef.substring("ORDER_".length()));
            } else if (txnRef.startsWith("BALANCE_")) {
                orderId = extractNumericId(txnRef.substring("BALANCE_".length()));
            }
        }
        String buyerRedirect = buildBuyerReturnRedirect(orderId, txnRef, responseCode, success && applied);
        return ResponseEntity.status(302).header(HttpHeaders.LOCATION, buyerRedirect).build();
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
            if (order.getFulfillmentType() == OrderFulfillmentType.DIRECT) {
                order.setStatus(OrderStatus.PENDING_SELLER_SHIP);
            } else {
                order.setStatus(OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
            }
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

    private String buildBuyerReturnRedirect(Long orderId, String txnRef, String responseCode, boolean ok) {
        String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/+$", "");
        String listingId = "";
        String orderIdText = "";
        if (orderId != null) {
            orderIdText = String.valueOf(orderId);
            listingId = orderRepository.findById(orderId)
                .map(o -> String.valueOf(o.getListing().getId()))
                .orElse("");
        }
        String txn = txnRef == null ? "" : txnRef;
        String rc = responseCode == null ? "" : responseCode;
        return base
            + "/payment/vnpay-result?gate=buyer"
            + "&ok=" + (ok ? "1" : "0")
            + "&orderId=" + encode(orderIdText)
            + "&listingId=" + encode(listingId)
            + "&orderCode=" + encode(txn)
            + "&vnp_ResponseCode=" + encode(rc);
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String buildVnpaySandboxPaymentUrl(String txnRef, String orderInfo, long amountVnd) {
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
        vnp.put("vnp_CreateDate", LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
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
            if (i > 0) query.append("&");
            query.append(encode(k)).append("=").append(encode(vnp.get(k)));
        }
        String secureHash = hmacSha512(vnpHashSecret, query.toString());
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
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

