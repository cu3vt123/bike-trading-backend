package com.biketrading.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/buyer/payments")
public class PaymentController {

    // API Khởi tạo thanh toán giả lập cho Frontend test
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> paymentPayload) {
        String method = (String) paymentPayload.getOrDefault("method", "CARD");

        Map<String, Object> paymentMethodResponse;

        // Giả lập trả về thông tin thẻ Visa hoặc Chuyển khoản
        if ("CARD".equals(method)) {
            paymentMethodResponse = Map.of(
                    "type", "CARD",
                    "brand", "Visa",
                    "last4", "4242"
            );
        } else {
            paymentMethodResponse = Map.of(
                    "type", "BANK_TRANSFER",
                    "bankRef", "BANK-MOCK-VN"
            );
        }

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "paymentMethod", paymentMethodResponse,
                "message", "Khởi tạo giao dịch giả lập thành công!"
        ));
    }
}