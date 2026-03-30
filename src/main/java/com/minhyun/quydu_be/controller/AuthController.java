package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.dto.request.ForgotPasswordRequest;
import com.minhyun.quydu_be.dto.request.LoginRequest;
import com.minhyun.quydu_be.dto.request.RefreshTokenRequest;
import com.minhyun.quydu_be.dto.request.ResetPasswordRequest;
import com.minhyun.quydu_be.dto.request.SignupRequest;
import com.minhyun.quydu_be.dto.response.AuthResponse;
import com.minhyun.quydu_be.dto.response.MeResponse;
import com.minhyun.quydu_be.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new ApiResponse<>(true, "Signup successful", authService.signup(request))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Login successful", authService.login(request))
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Token refreshed", authService.refresh(request))
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> me() {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Fetched profile", authService.me())
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Forgot password processed", authService.forgotPassword(request))
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Password reset processed", authService.resetPassword(request))
        );
    }
}
