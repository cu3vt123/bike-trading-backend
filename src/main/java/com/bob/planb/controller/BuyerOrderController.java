package com.bob.planb.controller;

import com.bob.planb.config.VNPayConfig;
import com.bob.planb.dto.CheckoutRequest;
import com.bob.planb.entity.*;
import com.bob.planb.repository.ListingRepository;
import com.bob.planb.repository.OrderRepository;
import com.bob.planb.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
public class BuyerOrderController {

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.url}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    // 1. Lấy danh sách đơn hàng
    @GetMapping
    public ResponseEntity<?> getMyOrders() {
        User user = getCurrentUser();
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(Map.of("data", orders));
    }

    // 2. Lấy chi tiết 1 đơn hàng (Dùng cho TransactionPage)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getBuyerId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền xem đơn hàng này."));
        }
        return ResponseEntity.ok(Map.of("data", order));
    }

    // 3. TẠO ĐƠN HÀNG VÀ THANH TOÁN VNPAY (Khớp 100% FE)
    @PostMapping("/vnpay-checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request, HttpServletRequest httpServletRequest) throws Exception {
        User buyer = getCurrentUser();

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe."));

        if (listing.getState() != ListingState.PUBLISHED || listing.isHidden()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe này hiện không còn bán trên sàn."));
        }

        if (listing.getSeller().getId().equals(buyer.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Bạn không thể tự mua xe của chính mình."));
        }

        String orderCode = "ORD-" + VNPayConfig.getRandomNumber(8);
        String plan = request.getPlan().toUpperCase();

        // Tính toán số tiền: Nếu là FULL -> Thanh toán 100%. Nếu là DEPOSIT -> Cọc 10%.
        Double totalAmount = listing.getPrice();
        Double depositAmount = plan.equals("DEPOSIT") ? (totalAmount * 0.1) : totalAmount;

        // Xử lý địa chỉ
        String address = request.getShippingAddress().getStreet() + ", " + request.getShippingAddress().getCity();

        Order order = Order.builder()
                .orderCode(orderCode)
                .buyerId(buyer.getId())
                .sellerId(listing.getSeller().getId())
                .listingId(listing.getId())
                .listingTitle(listing.getTitle())
                .amount(totalAmount)
                .plan(plan)
                .depositAmount(depositAmount)
                .balancePaid(plan.equals("FULL"))
                .vnpayPaymentStatus("PENDING_PAYMENT")
                .fulfillmentType("WAREHOUSE") // Mặc định qua kho kiểm định
                .acceptedUnverifiedDisclaimer(request.getAcceptedUnverifiedDisclaimer() != null ? request.getAcceptedUnverifiedDisclaimer() : false)
                .paymentMethod(PaymentMethod.VNPAY)
                .status(OrderStatus.PENDING)

                // ĐÃ KHÔI PHỤC LẠI: Lấy tên hiển thị, nếu null thì để "Khách hàng"
                .receiverName(buyer.getDisplayName() != null ? buyer.getDisplayName() : "Khách hàng")

                .receiverPhone("Đang cập nhật")
                .shippingAddress(address)
                .build();

        // Khóa xe lại (Tránh người khác mua trùng)
        listing.setState(ListingState.RESERVED);
        orderRepository.save(order);
        listingRepository.save(listing);

        // Tạo URL VNPay
        String paymentUrl = generateVnpayUrl(depositAmount.longValue(), orderCode, httpServletRequest);

        return ResponseEntity.ok(Map.of("data", Map.of(
                "order", order,
                "paymentUrl", paymentUrl
        )));
    }

    // 4. TIẾP TỤC THANH TOÁN (Trường hợp rớt mạng / tắt trình duyệt)
    @PostMapping("/{id}/vnpay-resume")
    public ResponseEntity<?> resumeVnpayCheckout(@PathVariable Long id, HttpServletRequest httpServletRequest) throws Exception {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(buyer.getId()) || !"PENDING_PAYMENT".equals(order.getVnpayPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng không hợp lệ để tiếp tục thanh toán."));
        }

        // Mã giao dịch mới để tránh trùng lặp VNPAY
        String newTxnRef = order.getOrderCode() + "-" + VNPayConfig.getRandomNumber(3);
        String paymentUrl = generateVnpayUrl(order.getDepositAmount().longValue(), newTxnRef, httpServletRequest);

        return ResponseEntity.ok(Map.of("data", Map.of("paymentUrl", paymentUrl)));
    }

    // 5. THANH TOÁN SỐ DƯ CÒN LẠI (Dành cho gói DEPOSIT)
    @PostMapping("/{id}/vnpay-pay-balance")
    public ResponseEntity<?> payBalance(@PathVariable Long id, HttpServletRequest httpServletRequest) throws Exception {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(buyer.getId()) || order.getBalancePaid()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng này không cần thanh toán số dư."));
        }

        Long balanceAmount = (long) (order.getAmount() - order.getDepositAmount());
        String balanceTxnRef = order.getOrderCode() + "-BAL-" + VNPayConfig.getRandomNumber(3);

        String paymentUrl = generateVnpayUrl(balanceAmount, balanceTxnRef, httpServletRequest);

        return ResponseEntity.ok(Map.of("data", Map.of("paymentUrl", paymentUrl)));
    }

    // 6. HỦY ĐƠN HÀNG
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(buyer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Từ chối truy cập."));
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Trả xe về sàn
        Listing listing = listingRepository.findById(order.getListingId()).orElse(null);
        if (listing != null) {
            listing.setState(ListingState.PUBLISHED);
            listingRepository.save(listing);
        }

        return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng thành công.", "data", order));
    }

    // 7. HOÀN TẤT ĐƠN HÀNG (Người mua xác nhận đã nhận xe)
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(buyer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Từ chối truy cập."));
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // Cập nhật xe thành ĐÃ BÁN (SOLD)
        Listing listing = listingRepository.findById(order.getListingId()).orElse(null);
        if (listing != null) {
            listing.setState(ListingState.SOLD);
            listingRepository.save(listing);
        }

        return ResponseEntity.ok(Map.of("message", "Cảm ơn bạn đã xác nhận nhận xe!", "data", order));
    }


    // ==========================================
    // HÀM HỖ TRỢ: TẠO URL VNPAY (GIÚP CODE GỌN GÀNG)
    // ==========================================
    private String generateVnpayUrl(long amount, String txnRef, HttpServletRequest request) throws Exception {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY yêu cầu nhân 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + txnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

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

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnp_PayUrl + "?" + queryUrl;
    }

}