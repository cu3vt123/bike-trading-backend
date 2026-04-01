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
import com.minhyun.quydu_be.exception.ErrorResponse;
import com.minhyun.quydu_be.repository.OrderRepository;
import com.minhyun.quydu_be.repository.PackageOrderRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import com.minhyun.quydu_be.service.VnpayUrlService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final VnpayUrlService vnpayUrlService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public PaymentController(
        OrderRepository orderRepository,
        PackageOrderRepository packageOrderRepository,
        UserRepository userRepository,
        VnpayUrlService vnpayUrlService
    ) {
        this.orderRepository = orderRepository;
        this.packageOrderRepository = packageOrderRepository;
        this.userRepository = userRepository;
        this.vnpayUrlService = vnpayUrlService;
    }

    /**
     * Create a signed VNPAY payment URL for an existing order (deposit/full step).
     * <p><b>GET is not supported</b> on {@code /payment/create} — use this POST with JSON body.</p>
     */
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
        String url = vnpayUrlService.buildPaymentUrl(txnRef, "ShopBike order " + orderId, amountVnd);
        return RestResponses.okData(Map.of("paymentUrl", url));
    }

    @GetMapping("/create")
    public ResponseEntity<ErrorResponse> createGetNotAllowed(HttpServletRequest request) {
        ErrorResponse body = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.METHOD_NOT_ALLOWED.value(),
            HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase(),
            "Use POST with Content-Type: application/json and body {\"orderId\": <long>}. "
                + "Opening /payment/create in a browser (GET) is not supported; use Swagger, curl, or the FE calling POST.",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
            .header(HttpHeaders.ALLOW, "POST")
            .body(body);
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
        if (txnRef == null || txnRef.isBlank()) {
            return false;
        }
        try {
            if (txnRef.startsWith("ORDER_")) {
                Long orderId = extractNumericId(txnRef.substring("ORDER_".length()));
                if (orderId == null) {
                    return false;
                }
                return orderRepository.findById(orderId).map(o -> {
                    markDepositPaid(o);
                    return true;
                }).orElse(false);
            } else if (txnRef.startsWith("BALANCE_")) {
                Long orderId = extractNumericId(txnRef.substring("BALANCE_".length()));
                if (orderId == null) {
                    return false;
                }
                return orderRepository.findById(orderId).map(o -> {
                    markBalancePaid(o);
                    return true;
                }).orElse(false);
            } else if (txnRef.startsWith("PACKAGE_")) {
                Long packageOrderId = extractNumericId(txnRef.substring("PACKAGE_".length()));
                if (packageOrderId == null) {
                    return false;
                }
                return packageOrderRepository.findById(packageOrderId).map(p -> {
                    markPackagePaid(p);
                    return true;
                }).orElse(false);
            }
            return false;
        } catch (Exception ignored) {
            return false;
        }
    }

    private Long extractNumericId(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        StringBuilder digits = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (Character.isDigit(c)) {
                digits.append(c);
            } else {
                break;
            }
        }
        if (digits.isEmpty()) {
            return null;
        }
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
            // DIRECT: seller giao thẳng — buyer chờ seller.
            // WAREHOUSE (xe đã CERTIFIED trên sàn): coi như vận hành tại kho — buyer thấy trạng thái kho (FE: order.statusAT_WAREHOUSE_*),
            // không còn nhãn "chờ seller gửi xe". Admin xác nhận giao từ kho → SHIPPING.
            if (order.getFulfillmentType() == OrderFulfillmentType.WAREHOUSE) {
                order.setStatus(OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
            } else {
                order.setStatus(OrderStatus.PENDING_SELLER_SHIP);
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
}
