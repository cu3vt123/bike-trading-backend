package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.request.CreateOrderRequest;
import com.minhyun.quydu_be.dto.request.CreateReviewRequest;
import com.minhyun.quydu_be.dto.request.InitiatePaymentRequest;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.service.BuyerService;
import com.minhyun.quydu_be.web.RestResponses;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buyer")
@PreAuthorize("hasAnyRole('BUYER','ADMIN')")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping("/orders/vnpay-checkout")
    public ResponseEntity<Map<String, Object>> createOrderVnpayCheckout(@Valid @RequestBody CreateOrderRequest request) {
        return RestResponses.createdData(buyerService.createOrderVnpayCheckout(request));
    }

    @PostMapping("/orders/{id}/vnpay-resume")
    public ResponseEntity<Map<String, Object>> resumeOrderVnpay(@PathVariable Long id) {
        return RestResponses.okData(buyerService.resumeOrderVnpay(id));
    }

    @PostMapping("/orders/{id}/vnpay-pay-balance")
    public ResponseEntity<Map<String, Object>> payBalanceVnpay(@PathVariable Long id) {
        return RestResponses.okData(buyerService.payBalanceVnpay(id));
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return RestResponses.createdData(buyerService.createOrder(request));
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getMyOrders() {
        return RestResponses.okData(buyerService.getMyOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable Long id) {
        return RestResponses.okData(buyerService.getOrderById(id));
    }

    /**
     * Chi tiết giao dịch sau thanh toán — khớp route FE dạng {@code /transaction/{listingId}?orderId=}.
     * Path là <strong>listingId</strong>, không phải orderId. Query {@code orderId} tùy chọn để chỉ định đơn.
     */
    @GetMapping(value = {"/orders/by-listing/{listingId}", "/transactions/{listingId}"})
    public ResponseEntity<Map<String, Object>> getOrderForListingTransaction(
        @PathVariable Long listingId,
        @RequestParam(name = "orderId", required = false) Long orderId
    ) {
        return RestResponses.okData(buyerService.getOrderForListingTransaction(listingId, orderId));
    }

    @PutMapping("/orders/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeOrder(@PathVariable Long id) {
        return RestResponses.okData(buyerService.completeOrder(id));
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Long id) {
        return RestResponses.okData(buyerService.cancelOrder(id));
    }

    @PostMapping("/orders/{id}/review")
    public ResponseEntity<Map<String, Object>> createReviewForOrder(
        @PathVariable Long id,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        return RestResponses.createdData(buyerService.createReviewForOrder(id, request));
    }

    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> listMyReviews() {
        return RestResponses.okData(buyerService.listMyReviews());
    }

    @PostMapping("/payments/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(@Valid @RequestBody InitiatePaymentRequest request) {
        if (!"CASH".equalsIgnoreCase(request.getMethod())) {
            throw new BadRequestException("Invalid payment payload (chi ho tro CASH)");
        }
        return RestResponses.okData(buyerService.initiateCashPayment());
    }
}

