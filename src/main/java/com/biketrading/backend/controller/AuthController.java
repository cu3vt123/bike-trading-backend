package com.biketrading.backend.controller;

import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.dto.SignupRequest;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.enums.UserRole;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Map<String, Object> buildSubscriptionMap(User user) {
        Map<String, Object> subscription = new LinkedHashMap<>();
        SubscriptionPlan currentPlan = user.getCurrentPlan() != null ? user.getCurrentPlan() : SubscriptionPlan.FREE;
        subscription.put("currentPlan", currentPlan.toString());
        subscription.put("remainingListings", user.getRemainingListings());
        subscription.put("packageExpiryDate",
                user.getPackageExpiryDate() != null ? user.getPackageExpiryDate().toString() : null);
        subscription.put("inspectionCredits", user.getInspectionCredits());
        return subscription;
    }

    private String generateUsername(String requestedUsername, String email) {
        String base = (requestedUsername != null && !requestedUsername.trim().isEmpty())
                ? requestedUsername.trim()
                : email.substring(0, email.indexOf("@"));

        base = base.replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank()) {
            base = "user" + new Random().nextInt(99999);
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email đã tồn tại"));
        }

        String username = generateUsername(request.getUsername(), email);

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role không hợp lệ"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setDisplayName(username);

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accessToken", token);
        response.put("role", user.getRole().name());
        response.put("subscription", buildSubscriptionMap(user));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String identifier = request.getEmailOrUsername() == null ? "" : request.getEmailOrUsername().trim();

        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier.toLowerCase());
        }

        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();

            String token = tokenProvider.generateToken(user.getUsername());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("accessToken", token);
            response.put("role", user.getRole().name());
            response.put("subscription", buildSubscriptionMap(user));

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

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", String.valueOf(user.getId()));
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("displayName",
                user.getDisplayName() != null && !user.getDisplayName().isBlank()
                        ? user.getDisplayName()
                        : user.getUsername());
        response.put("role", user.getRole().name());
        response.put("subscription", buildSubscriptionMap(user));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "message",
                "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "message",
                "Đặt lại mật khẩu thành công (bản demo)."
        ));
    }
}