package com.bob.planb.controller;

import com.bob.planb.entity.Role;
import com.bob.planb.entity.User;
import com.bob.planb.repository.UserRepository;
import com.bob.planb.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // --- DTOs (Data Transfer Objects) ---
    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class SignupRequest {
        private String email;
        private String password;
        private String displayName;
        private String role; // "BUYER", "SELLER", "ADMIN", "INSPECTOR"
    }

    // --- ENDPOINTS ---

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // 1. Xác thực thông tin đăng nhập
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 2. Tạo JWT Token
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 3. Lấy thông tin User để trả về kèm Token
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return ResponseEntity.ok(Map.of(
                "accessToken", jwt,
                "tokenType", "Bearer",
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "displayName", user.getDisplayName(),
                        "role", user.getRole(),
                        "totalPostAllowed", user.getTotalPostAllowed(),
                        "usedPost", user.getUsedPost()
                )
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        // 1. Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: Email này đã được sử dụng!"));
        }

        // 2. Tạo User mới
        User user = User.builder()
                .email(signupRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signupRequest.getPassword()))
                .displayName(signupRequest.getDisplayName())
                .totalPostAllowed(0) // Mặc định chưa có lượt đăng tin
                .usedPost(0)
                .build();

        // 3. Phân quyền (Role)
        String strRole = signupRequest.getRole();
        if (strRole == null) {
            user.setRole(Role.BUYER);
        } else {
            switch (strRole.toUpperCase()) {
                case "ADMIN":
                    user.setRole(Role.ADMIN);
                    break;
                case "SELLER":
                    user.setRole(Role.SELLER);
                    break;
                case "INSPECTOR":
                    user.setRole(Role.INSPECTOR);
                    break;
                default:
                    user.setRole(Role.BUYER);
            }
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đăng ký tài khoản thành công!"));
    }

    // API tiện ích để lấy thông tin User hiện tại từ Token
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of("data", user));
    }
}