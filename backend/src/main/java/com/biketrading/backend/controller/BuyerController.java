package com.biketrading.backend.controller;

import com.biketrading.backend.dto.CreateOrderRequest;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.Review;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.*;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.ReviewRepository;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.CurrentUserService;
import com.biketrading.backend.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {
    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;

    public BuyerController(OrderRepository orderRepository, ListingRepository listingRepository, ReviewRepository reviewRepository, UserRepository userRepository, CurrentUserService currentUserService) {
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> create(@Valid @RequestBody CreateOrderRequest request) {
        Order order = createOrderInternal(request, true);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }

    @PostMapping("/orders/vnpay-checkout")
    public ResponseEntity<?> createVnpay(@Valid @RequestBody CreateOrderRequest request) {
        Order order = createOrderInternal(request, false);
        BigDecimal amount = "FULL".equalsIgnoreCase(request.getPlan())
                ? order.getTotalPrice()
                : order.getDepositAmount();
        order.setVnpayPaymentStatus("PENDING_PAYMENT");
        order.setVnpayAmountVnd(amount);
        orderRepository.save(order);
        String paymentUrl = frontendBaseUrl + "/transaction/" + order.getListing().getId() + "?orderId=" + order.getId();
        Map<String, Object> out = MapperUtil.orderDto(order);
        out.put("paymentUrl", paymentUrl);
        out.put("txnRef", "ORDER_" + order.getId());
        return ApiResponse.ok(out);
    }

    @PostMapping("/orders/{id}/vnpay-resume")
    public ResponseEntity<?> resume(@PathVariable Long id) {
        Order order = requireOwnOrder(id);
        String paymentUrl = frontendBaseUrl + "/transaction/" + order.getListing().getId() + "?orderId=" + order.getId();
        order.setDepositPaid(true);
        order.setVnpayPaymentStatus("PAID");
        orderRepository.save(order);
        return ApiResponse.ok(Map.of(
                "paymentUrl", paymentUrl,
                "txnRef", "ORDER_" + order.getId(),
                "orderId", String.valueOf(order.getId()),
                "vnpayAmountVnd", order.getVnpayAmountVnd()
        ));
    }

    @PostMapping("/orders/{id}/vnpay-pay-balance")
    public ResponseEntity<?> payBalance(@PathVariable Long id) {
        Order order = requireOwnOrder(id);
        order.setBalancePaid(true);
        orderRepository.save(order);
        String paymentUrl = frontendBaseUrl + "/finalize/" + order.getListing().getId() + "?orderId=" + order.getId() + "&vnpay_balance=1";
        BigDecimal balance = order.getTotalPrice().subtract(order.getDepositAmount() == null ? BigDecimal.ZERO : order.getDepositAmount());
        return ApiResponse.ok(Map.of(
                "paymentUrl", paymentUrl,
                "orderId", String.valueOf(order.getId()),
                "balanceAmount", balance
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> myOrders() {
        User buyer = currentUserService.requireUser();
        List<?> items = orderRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream().map(MapperUtil::orderDto).collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ApiResponse.ok(MapperUtil.orderDto(requireOwnOrder(id)));
    }

    @PutMapping("/orders/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id) {
        Order order = requireOwnOrder(id);
        order.setStatus(OrderStatus.COMPLETED);
        order.getListing().setState(ListingState.SOLD);
        listingRepository.save(order.getListing());
        orderRepository.save(order);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        Order order = requireOwnOrder(id);
        order.setStatus(OrderStatus.CANCELLED);
        Listing listing = order.getListing();
        if (listing.getCertificationStatus() == CertificationStatus.CERTIFIED) {
            listing.setState(ListingState.PUBLISHED);
        } else {
            listing.setState(ListingState.PUBLISHED);
        }
        listingRepository.save(listing);
        orderRepository.save(order);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }

    @PostMapping("/orders/{id}/review")
    public ResponseEntity<?> createReview(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Order order = requireOwnOrder(id);
        if (order.getStatus() != OrderStatus.COMPLETED) return ApiResponse.error(HttpStatus.BAD_REQUEST, "Order must be completed before review");
        User buyer = currentUserService.requireUser();
        User seller = order.getListing().getSeller();
        Review review = new Review();
        review.setOrder(order);
        review.setListing(order.getListing());
        review.setBuyer(buyer);
        review.setSeller(seller);
        review.setRating(Integer.parseInt(String.valueOf(body.getOrDefault("rating", "5"))));
        review.setComment(String.valueOf(body.getOrDefault("comment", "")));
        reviewRepository.save(review);
        return ApiResponse.created(MapperUtil.reviewDto(review));
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> myReviews() {
        User buyer = currentUserService.requireUser();
        return ApiResponse.ok(reviewRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream().map(MapperUtil::reviewDto).collect(Collectors.toList()));
    }

    private Order createOrderInternal(CreateOrderRequest request, boolean markPaid) {
        User buyer = currentUserService.requireUser();
        Listing listing = listingRepository.findById(request.getListingId()).orElseThrow(() -> new RuntimeException("Listing not found"));
        if (listing.getState() != ListingState.PUBLISHED) {
            throw new RuntimeException("Listing not published");
        }
        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setPlan(request.getPlan().toUpperCase());
        order.setTotalPrice(listing.getPrice());
        order.setDepositAmount(listing.getPrice().multiply(new BigDecimal("0.08")).setScale(0, java.math.RoundingMode.HALF_UP));
        order.setDepositPaid(markPaid);
        order.setBalancePaid(false);
        order.setShippingStreet(request.getShippingAddress().getStreet());
        order.setShippingCity(request.getShippingAddress().getCity());
        order.setShippingPostalCode(request.getShippingAddress().getPostalCode());
        order.setStatus(OrderStatus.PENDING_SELLER_SHIP);
        order.setExpiresAt(LocalDateTime.now().plusDays(2));
        order.setFulfillmentType(listing.getCertificationStatus() == CertificationStatus.CERTIFIED ? OrderFulfillmentType.WAREHOUSE : OrderFulfillmentType.DIRECT);
        if (markPaid) {
            order.setVnpayPaymentStatus("PAID");
            order.setVnpayAmountVnd("FULL".equalsIgnoreCase(request.getPlan()) ? order.getTotalPrice() : order.getDepositAmount());
        }
        orderRepository.save(order);
        listing.setState(ListingState.IN_TRANSACTION);
        listingRepository.save(listing);
        return order;
    }

    private Order requireOwnOrder(Long id) {
        User buyer = currentUserService.requireUser();
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Forbidden");
        }
        return order;
    }
}
