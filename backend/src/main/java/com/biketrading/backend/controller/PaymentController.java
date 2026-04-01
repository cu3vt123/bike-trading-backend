package com.biketrading.backend.controller;

import com.biketrading.backend.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/buyer/payments")
public class PaymentController {
    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("message", "Legacy payment initiate is mocked"));
    }
}
