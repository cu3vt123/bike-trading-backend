package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.dto.request.ForgotPasswordRequest;
import com.minhyun.quydu_be.dto.request.LoginRequest;
import com.minhyun.quydu_be.dto.request.RefreshTokenRequest;
import com.minhyun.quydu_be.dto.request.ResetPasswordRequest;
import com.minhyun.quydu_be.dto.request.SignupRequest;
import com.minhyun.quydu_be.dto.response.AuthResponse;
import com.minhyun.quydu_be.dto.response.MeResponse;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.entity.SubscriptionPlan;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.entity.UserRole;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.subscription.SubscriptionPostingQuota;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.UnauthorizedException;
import com.minhyun.quydu_be.repository.UserRepository;
import com.minhyun.quydu_be.security.CustomUserDetails;
import com.minhyun.quydu_be.security.JwtTokenProvider;
import com.minhyun.quydu_be.service.AuthService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(
        UserRepository userRepository,
        ListingRepository listingRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (request.getRole() != UserRole.BUYER && request.getRole() != UserRole.SELLER) {
            throw new BadRequestException("Role must be BUYER or SELLER for signup");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDisplayName(resolveDisplayName(request.getUsername(), email));
        userRepository.save(user);

        return tokensForUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmailOrUsername().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UnauthorizedException("Không tìm thấy tài khoản với email này."));

        if (user.isHidden()) {
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Mật khẩu không đúng.");
        }

        return tokensForUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        Long userId = jwtTokenProvider.validateRefreshTokenAndGetUserId(request.getRefreshToken());
        if (userId == null) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (user.isHidden()) {
            throw new UnauthorizedException("Account disabled");
        }
        return tokensForUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public MeResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("Missing authenticated user");
        }

        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        return new MeResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getRole(),
            subscriptionSummary(user)
        );
    }

    @Override
    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return Map.of("message", "If account exists, reset email will be sent.");
        }

        String token = generateToken();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        return Map.of("message", "Reset token generated (demo).", "token", token);
    }

    @Override
    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired token");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);

        return Map.of("message", "Password updated");
    }

    private AuthResponse tokensForUser(User user) {
        String access = jwtTokenProvider.generateToken(user.getId());
        String refresh = jwtTokenProvider.generateRefreshToken(user.getId());
        if (user.getRole() == UserRole.SELLER) {
            return new AuthResponse(access, refresh, user.getRole(), subscriptionSummary(user));
        }
        return new AuthResponse(access, refresh, user.getRole());
    }

    private String resolveDisplayName(String username, String email) {
        if (username != null && !username.isBlank()) return username.trim();
        int atIndex = email.indexOf("@");
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private String generateToken() {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private Map<String, Object> subscriptionSummary(User user) {
        Map<String, Object> out = new LinkedHashMap<>();
        SubscriptionPlan plan = user.getSubscriptionPlan();
        boolean active = plan != null
            && user.getSubscriptionExpiresAt() != null
            && user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now());
        int limit = SubscriptionPostingQuota.limitForPlan(plan);
        long used = 0;
        if (user.getRole() == UserRole.SELLER && active && plan != null) {
            used = listingRepository.countOccupyingPostingSlots(user.getId(), ListingState.REJECTED);
        }
        out.put("active", active);
        out.put("plan", plan == null ? null : plan.name());
        out.put("expiresAt", user.getSubscriptionExpiresAt() == null ? null : user.getSubscriptionExpiresAt().toString());
        out.put("publishedSlotsUsed", used);
        out.put("publishedSlotsLimit", limit);
        out.put("listingDurationDays", 30);
        return out;
    }
}
