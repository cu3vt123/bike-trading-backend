package com.biketrading.backend.controller;

import com.biketrading.backend.dto.LoginRequest;
import com.biketrading.backend.dto.SignupRequest;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.enums.UserRole;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.security.JwtTokenProvider;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.CurrentUserService;
import com.biketrading.backend.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public AuthController(UserRepository userRepository, ListingRepository listingRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder, CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        String username = request.getUsername() == null || request.getUsername().isBlank()
                ? request.getEmail().split("@")[0]
                : request.getUsername().trim();
        if (userRepository.findByUsername(username).isPresent()) {
            username = username + System.currentTimeMillis() % 1000;
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Role invalid");
        }
        if (role == UserRole.ADMIN || role == UserRole.INSPECTOR) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Only BUYER or SELLER can self-register");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(request.getEmail().trim());
        user.setDisplayName(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        if (role == UserRole.SELLER) {
            user.setSubscriptionPlan(SubscriptionPlan.BASIC);
            user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(14));
            user.setPublishedSlotsLimit(7);
        }
        userRepository.save(user);

        return ApiResponse.ok(buildAuthPayload(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getEmailOrUsername().trim());
        if (userOpt.isEmpty()) userOpt = userRepository.findByEmail(request.getEmailOrUsername().trim());
        if (userOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return ApiResponse.ok(buildAuthPayload(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        User user = currentUserService.requireUser();
        long published = user.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(user, com.biketrading.backend.enums.ListingState.PUBLISHED) : 0;
        return ApiResponse.ok(MapperUtil.userDto(user, published));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgot(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "Demo mode: reset email skipped"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(Map.of("message", "Demo mode: password reset skipped"));
    }

    private Map<String, Object> buildAuthPayload(User user) {
        long published = user.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(user, com.biketrading.backend.enums.ListingState.PUBLISHED) : 0;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("accessToken", jwtTokenProvider.generateToken(user.getUsername()));
        payload.put("role", user.getRole().name());
        payload.put("subscription", MapperUtil.sellerSubscription(user, published));
        return payload;
    }
}
