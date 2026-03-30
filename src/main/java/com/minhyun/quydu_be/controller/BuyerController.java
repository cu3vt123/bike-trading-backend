package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.dto.request.CreateOrderRequest;
import com.minhyun.quydu_be.dto.request.CreateReviewRequest;
import com.minhyun.quydu_be.dto.request.InitiatePaymentRequest;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.service.BuyerService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrderVnpayCheckout(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Order created", buyerService.createOrderVnpayCheckout(request)));
    }

    @PostMapping("/orders/{id}/vnpay-resume")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumeOrderVnpay(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume VNPAY", buyerService.resumeOrderVnpay(id)));
    }

    @PostMapping("/orders/{id}/vnpay-pay-balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> payBalanceVnpay(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Pay balance", buyerService.payBalanceVnpay(id)));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Order created", buyerService.createOrder(request)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyOrders() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched orders", buyerService.getMyOrders()));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched order", buyerService.getOrderById(id)));
    }

    @PutMapping("/orders/{id}/complete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order completed", buyerService.completeOrder(id)));
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order cancelled", buyerService.cancelOrder(id)));
    }

    @PostMapping("/orders/{id}/review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReviewForOrder(
        @PathVariable Long id,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Review created", buyerService.createReviewForOrder(id, request)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listMyReviews() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched reviews", buyerService.listMyReviews()));
    }

    @PostMapping("/payments/initiate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiatePayment(@Valid @RequestBody InitiatePaymentRequest request) {
        if (!"CASH".equalsIgnoreCase(request.getMethod())) {
            throw new BadRequestException("Invalid payment payload (chi ho tro CASH)");
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment initiated", buyerService.initiateCashPayment()));
    }
}
