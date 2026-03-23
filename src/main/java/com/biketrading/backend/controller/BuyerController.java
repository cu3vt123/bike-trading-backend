package com.biketrading.backend.controller;

import com.biketrading.backend.config.VNPayConfig;
import com.biketrading.backend.dto.CreateOrderRequest;
import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.OrderFulfillmentType;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/buyer")
@Transactional
public class BuyerController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VNPayConfig vnPayConfig;

    private User getCurrentBuyer() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    private OrderFulfillmentType resolveFulfillmentType(Listing listing) {
        return Boolean.TRUE.equals(listing.getIsVerified())
                ? OrderFulfillmentType.WAREHOUSE
                : OrderFulfillmentType.DIRECT;
    }

    private BigDecimal resolveDepositAmount(Listing listing, String plan) {
        if ("FULL".equalsIgnoreCase(plan)) {
            return listing.getPrice();
        }
        BigDecimal fiveMillion = BigDecimal.valueOf(5_000_000L);
        return listing.getPrice().compareTo(fiveMillion) < 0 ? listing.getPrice() : fiveMillion;
    }

    private String buildBuyerTxnRef(Long orderId) {
        return "B" + orderId;
    }

    private String buildVnpayUrl(String txnRef, long amountVnd, String orderInfo) throws Exception {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "billpayment");
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

        return vnPayConfig.vnp_PayUrl + "?" + query;
    }

    private Map<String, Object> mapOrder(Order order) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", String.valueOf(order.getId()));
        map.put("listingId", order.getListing() != null ? String.valueOf(order.getListing().getId()) : null);
        map.put("buyerId", order.getBuyer() != null ? String.valueOf(order.getBuyer().getId()) : null);
        map.put("sellerId",
                order.getListing() != null && order.getListing().getSeller() != null
                        ? String.valueOf(order.getListing().getSeller().getId())
                        : null);

        map.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        map.put("fulfillmentType",
                order.getFulfillmentType() != null ? order.getFulfillmentType().name() : null);
        map.put("plan", order.getPaymentPlan());
        map.put("totalPrice", order.getTotalPrice());
        map.put("depositAmount", order.getDepositAmount());
        map.put("depositPaid", order.getDepositPaid());
        map.put("vnpayPaymentStatus", order.getVnpayPaymentStatus());
        map.put("vnpayAmountVnd", order.getVnpayAmountVnd());
        map.put("paymentMethod", order.getPaymentMethod());

        Map<String, Object> shipping = new LinkedHashMap<>();
        shipping.put("street", order.getShippingStreet());
        shipping.put("city", order.getShippingCity());
        shipping.put("postalCode", order.getShippingPostalCode());
        map.put("shippingAddress", shipping);

        map.put("shippedAt", order.getShippedAt() != null ? order.getShippedAt().toString() : null);
        map.put("warehouseConfirmedAt",
                order.getWarehouseConfirmedAt() != null ? order.getWarehouseConfirmedAt().toString() : null);
        map.put("reInspectionDoneAt",
                order.getReInspectionDoneAt() != null ? order.getReInspectionDoneAt().toString() : null);
        map.put("expiresAt", order.getExpiresAt() != null ? order.getExpiresAt().toString() : null);
        map.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        map.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);

        if (order.getListing() != null) {
            map.put("listing", ListingDTO.fromEntity(order.getListing()));
        }

        return map;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "Luồng hiện tại chỉ hỗ trợ /api/buyer/orders/vnpay-checkout"
        ));
    }

    @PostMapping("/orders/vnpay-checkout")
    public ResponseEntity<?> createOrderVnpayCheckout(@RequestBody CreateOrderRequest request) throws Exception {
        User buyer = getCurrentBuyer();

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe không còn sẵn để mua"));
        }

        OrderFulfillmentType fulfillmentType = resolveFulfillmentType(listing);

        if (fulfillmentType == OrderFulfillmentType.DIRECT
                && !Boolean.TRUE.equals(request.getAcceptedUnverifiedDisclaimer())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Bạn phải chấp nhận điều khoản mua xe chưa kiểm định"
            ));
        }

        String plan = request.getPlan() == null || request.getPlan().isBlank()
                ? "DEPOSIT"
                : request.getPlan().trim().toUpperCase();

        BigDecimal depositAmount = resolveDepositAmount(listing, plan);

        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setFulfillmentType(fulfillmentType);
        order.setStatus(fulfillmentType == OrderFulfillmentType.DIRECT
                ? OrderStatus.PENDING_SELLER_SHIP
                : OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
        order.setPaymentPlan(plan);
        order.setPaymentMethod("VNPAY_SANDBOX");
        order.setTotalPrice(listing.getPrice());
        order.setDepositAmount(depositAmount);
        order.setDepositPaid(false);
        order.setVnpayPaymentStatus("PENDING_PAYMENT");
        order.setVnpayAmountVnd(depositAmount.longValue());

        if (request.getShippingAddress() != null) {
            order.setShippingStreet(request.getShippingAddress().getStreet());
            order.setShippingCity(request.getShippingAddress().getCity());
            order.setShippingPostalCode(request.getShippingAddress().getPostalCode());
        }

        orderRepository.save(order);

        String txnRef = buildBuyerTxnRef(order.getId());
        order.setVnpayTxnRef(txnRef);
        orderRepository.save(order);

        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);

        String paymentUrl = buildVnpayUrl(
                txnRef,
                order.getVnpayAmountVnd(),
                "Thanh toan don hang #" + order.getId()
        );

        Map<String, Object> response = mapOrder(order);
        response.put("paymentUrl", paymentUrl);
        response.put("txnRef", txnRef);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{id}/vnpay-resume")
    public ResponseEntity<?> resumeVnpayCheckout(@PathVariable Long id) throws Exception {
        User buyer = getCurrentBuyer();

        Order order = orderRepository.findByIdAndBuyerId(id, buyer.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if ("PAID".equalsIgnoreCase(order.getVnpayPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng đã thanh toán"));
        }

        String txnRef = order.getVnpayTxnRef();
        if (txnRef == null || txnRef.isBlank()) {
            txnRef = buildBuyerTxnRef(order.getId());
            order.setVnpayTxnRef(txnRef);
            orderRepository.save(order);
        }

        long amount = order.getVnpayAmountVnd() != null
                ? order.getVnpayAmountVnd()
                : (order.getDepositAmount() != null ? order.getDepositAmount().longValue() : 0L);

        String paymentUrl = buildVnpayUrl(
                txnRef,
                amount,
                "Thanh toan tiep tuc don hang #" + order.getId()
        );

        return ResponseEntity.ok(Map.of(
                "paymentUrl", paymentUrl,
                "txnRef", txnRef,
                "orderId", String.valueOf(order.getId()),
                "vnpayAmountVnd", amount
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders() {
        User buyer = getCurrentBuyer();
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());
        return ResponseEntity.ok(orders.stream().map(this::mapOrder).toList());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        User buyer = getCurrentBuyer();
        Order order = orderRepository.findByIdAndBuyerId(id, buyer.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return ResponseEntity.ok(mapOrder(order));
    }

    @GetMapping("/transactions/{orderId}")
    public ResponseEntity<?> getTransactionStatus(@PathVariable Long orderId) {
        return getOrderById(orderId);
    }

    @PutMapping("/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        User buyer = getCurrentBuyer();

        Order order = orderRepository.findByIdAndBuyerId(id, buyer.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.SHIPPING) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng chưa ở trạng thái giao hàng"));
        }

        if (!Boolean.TRUE.equals(order.getDepositPaid())
                && !"PAID".equalsIgnoreCase(order.getVnpayPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng chưa thanh toán cọc"));
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        Listing listing = order.getListing();
        if (listing != null) {
            listing.setState(ListingState.SOLD);
            listingRepository.save(listing);
        }

        return ResponseEntity.ok(mapOrder(order));
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        User buyer = getCurrentBuyer();

        Order order = orderRepository.findByIdAndBuyerId(id, buyer.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getFulfillmentType() == OrderFulfillmentType.WAREHOUSE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Đơn hàng kho không cho phép hủy ở bước này"
            ));
        }

        if (order.getStatus() != OrderStatus.RESERVED
                && order.getStatus() != OrderStatus.PENDING_SELLER_SHIP) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Trạng thái đơn hàng không cho phép hủy"
            ));
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setVnpayPaymentStatus("FAILED");
        orderRepository.save(order);

        Listing listing = order.getListing();
        if (listing != null) {
            listing.setState(ListingState.PUBLISHED);
            listingRepository.save(listing);
        }

        return ResponseEntity.ok(mapOrder(order));
    }



    @GetMapping("/profile")
    public ResponseEntity<?> getBuyerProfile() {
        User buyer = getCurrentBuyer();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", String.valueOf(buyer.getId()));
        response.put("username", buyer.getUsername());
        response.put("email", buyer.getEmail());
        response.put("displayName", buyer.getDisplayName());
        return ResponseEntity.ok(response);
    }
}