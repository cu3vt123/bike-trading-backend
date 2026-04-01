package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.request.ForgotPasswordRequest;
import com.minhyun.quydu_be.dto.request.LoginRequest;
import com.minhyun.quydu_be.dto.request.RefreshTokenRequest;
import com.minhyun.quydu_be.dto.request.ResetPasswordRequest;
import com.minhyun.quydu_be.dto.request.SignupRequest;
import com.minhyun.quydu_be.service.AuthService;
import com.minhyun.quydu_be.web.RestResponses;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        return RestResponses.createdData(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return RestResponses.okData(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return RestResponses.okData(authService.refresh(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        return RestResponses.okData(authService.me());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return RestResponses.okData(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return RestResponses.okData(authService.resetPassword(request));
    }
}

