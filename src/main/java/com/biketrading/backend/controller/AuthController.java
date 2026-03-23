package com.biketrading.backend.controller;

import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.dto.SignupRequest;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.UserRole;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;

    // Hàm phụ trợ tạo thông tin gói cước
    private Map<String, Object> buildSubscriptionMap(User user) {
        Map<String, Object> subscription = new HashMap<>();
        subscription.put("currentPlan", user.getCurrentPlan().toString());
        subscription.put("remainingListings", user.getRemainingListings());
        subscription.put("packageExpiryDate", user.getPackageExpiryDate() != null ? user.getPackageExpiryDate().toString() : null);
        subscription.put("inspectionCredits", user.getInspectionCredits());
        return subscription;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        try {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role không hợp lệ. Chỉ chấp nhận BUYER, SELLER, INSPECTOR."));
        }

        user.setDisplayName(request.getUsername());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String identifier = request.getEmailOrUsername();
        Optional<User> userOpt = userRepository.findByUsername(identifier);

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = tokenProvider.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("role", user.getRole().name());
            response.put("subscription", buildSubscriptionMap(user)); // Gắn gói cước vào đây

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Token không hợp lệ"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", "U" + user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail() != null ? user.getEmail() : "");
        response.put("displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        response.put("role", user.getRole().name());
        response.put("subscription", buildSubscriptionMap(user)); // Gắn gói cước vào đây để F5 không bị sập

        return ResponseEntity.ok(response);
    }
}