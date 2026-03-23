package com.biketrading.backend.service;

import com.biketrading.backend.dto.*;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.exception.BadRequestException;
import com.biketrading.backend.exception.UnauthorizedException;
import com.biketrading.backend.repository.UserRepository;
import com.biketrading.backend.security.JwtTokenProvider;
import com.biketrading.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SubscriptionService subscriptionService;

    public LoginResponse signup(SignupRequest request) {
        Role role = request.getRole();

        if (role != Role.BUYER && role != Role.SELLER) {
            throw new BadRequestException("Chỉ cho phép đăng ký BUYER hoặc SELLER.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername() == null ? null : request.getUsername().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already exists");
        }

        if (username != null && !username.isBlank() && userRepository.existsByUsernameIgnoreCase(username)) {
            throw new BadRequestException("Username already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username == null || username.isBlank() ? null : username);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setDisplayName((username != null && !username.isBlank()) ? username : email.split("@")[0]);

        User saved = userRepository.save(user);
        String accessToken = jwtTokenProvider.generateToken(saved.getId());

        return new LoginResponse(
                accessToken,
                null,
                saved.getRole(),
                saved.getRole() == Role.SELLER ? subscriptionService.buildSummary(saved) : null
        );
    }

    public LoginResponse login(LoginRequest request) {
        String identifier = request.getEmailOrUsername().trim();
        String password = request.getPassword();

        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UnauthorizedException("Không tìm thấy tài khoản với email này."));

        if (Boolean.TRUE.equals(user.getIsHidden())) {
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Mật khẩu không đúng.");
        }

        String accessToken = jwtTokenProvider.generateToken(user.getId());

        return new LoginResponse(
                accessToken,
                null,
                user.getRole(),
                user.getRole() == Role.SELLER ? subscriptionService.buildSummary(user) : null
        );
    }

    public MeResponse me(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized"));

        return new MeResponse(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getRole() == Role.SELLER ? subscriptionService.buildSummary(user) : null
        );
    }

    public Object forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            return java.util.Map.of("message", "If account exists, reset email will be sent.");
        }

        String token = generateToken();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        return java.util.Map.of(
                "message", "Reset token generated (demo).",
                "token", token,
                "resetUrl", "http://localhost:5173/reset-password?token=" + token
        );
    }

    public Object resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findAll().stream()
                .filter(u -> request.getToken().equals(u.getResetPasswordToken()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);

        return java.util.Map.of("message", "Password updated");
    }

    private String generateToken() {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}