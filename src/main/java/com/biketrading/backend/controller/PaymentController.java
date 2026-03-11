package com.biketrading.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/buyer/payments")
public class PaymentController {

    @PostMapping("/initiate")
    @Operation(summary = "Giả lập xử lý thanh toán (Mock Payment)")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> paymentPayload) {
        String method = (String) paymentPayload.getOrDefault("method", "CARD");

        Map<String, Object> paymentMethodResponse;

        if ("CARD".equals(method)) {
            paymentMethodResponse = Map.of(
                    "type", "CARD",
                    "brand", "Visa",
                    "last4", "4242" // Mock số thẻ cuối
            );
        } else {
            paymentMethodResponse = Map.of(
                    "type", "BANK_TRANSFER",
                    "bankRef", "BANK-MOCK-VN"
            );
        }

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "paymentMethod", paymentMethodResponse
        ));
    }
}