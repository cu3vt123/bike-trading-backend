package com.biketrading.backend.controller;

import com.biketrading.backend.config.VNPayConfig;
import com.biketrading.backend.dto.CreateOrderRequest;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ListingRepository listingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VNPayConfig vnPayConfig;

    // Hàm phụ trợ lấy thông tin Buyer đang đăng nhập
    private User getCurrentBuyer() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    // 1. TẠO ĐƠN HÀNG MOCK (Bỏ qua VNPay)
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        User buyer = getCurrentBuyer();
        Listing listing = listingRepository.findById(request.getListingId()).orElse(null);

        if (listing == null || listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe không tồn tại hoặc chưa được đăng bán"));
        }

        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setStatus(OrderStatus.RESERVED);
        order.setPaymentPlan(request.getPlan());
        order.setDepositPaid(true); // Mock là đã thanh toán
        order.setTotalPrice(listing.getPrice());

        if (request.getShippingAddress() != null) {
            order.setShippingStreet(request.getShippingAddress().getStreet());
            order.setShippingCity(request.getShippingAddress().getCity());
            order.setShippingPostalCode(request.getShippingAddress().getPostalCode());
        }

        orderRepository.save(order);

        // Khóa tin đăng lại không cho người khác mua trùng
        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);

        return ResponseEntity.ok(order);
    }

    // 2. TẠO ĐƠN HÀNG + THANH TOÁN VNPAY (Khớp với API FE: orderApi.createVnpayCheckout)
    @PostMapping("/orders/vnpay-checkout")
    public ResponseEntity<?> createOrderVnpayCheckout(@RequestBody CreateOrderRequest request) throws Exception {
        User buyer = getCurrentBuyer();
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (listing.getState() != ListingState.PUBLISHED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe không tồn tại hoặc chưa được đăng bán"));
        }

        // Tạo Order
        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setStatus(OrderStatus.RESERVED);
        order.setPaymentPlan(request.getPlan());
        order.setTotalPrice(listing.getPrice());
        order.setDepositPaid(false); // Chờ VNPay gọi Webhook trả về mới đổi thành true

        if (request.getShippingAddress() != null) {
            order.setShippingStreet(request.getShippingAddress().getStreet());
            order.setShippingCity(request.getShippingAddress().getCity());
            order.setShippingPostalCode(request.getShippingAddress().getPostalCode());
        }

        // Tính tiền (Cọc 5tr hoặc trả Full)
        long amount = "DEPOSIT".equalsIgnoreCase(request.getPlan()) ? 5000000 : listing.getPrice().longValue();

        orderRepository.save(order);

        // Khóa xe
        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);

        // Tạo link VNPay
        String vnp_TxnRef = "ORDER_" + order.getId() + "_" + VNPayConfig.getRandomNumber(4);
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan xe " + listing.getTitle());
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

        // Trả về đúng format DTO VnpayCheckoutResponse của Frontend
        return ResponseEntity.ok(Map.of(
                "id", order.getId(),
                "status", order.getStatus(),
                "paymentUrl", paymentUrl,
                "txnRef", vnp_TxnRef,
                "vnpayPaymentStatus", "PENDING",
                "vnpayAmountVnd", amount
        ));
    }

    // 3. LẤY DANH SÁCH LỊCH SỬ ĐƠN HÀNG (FE: orderApi.getMyOrders)
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders() {
        User buyer = getCurrentBuyer();
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getBuyer().getId().equals(buyer.getId())).toList();
        return ResponseEntity.ok(orders);
    }
}