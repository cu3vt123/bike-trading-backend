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

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Bắt lỗi nếu Frontend gửi sai Role
        try {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role không hợp lệ. Chỉ chấp nhận BUYER, SELLER, INSPECTOR."));
        }

        user.setDisplayName(request.getUsername()); // Mặc định lấy username làm tên hiển thị ban đầu
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());
        return ResponseEntity.status(201).body(Map.of(
                "accessToken", token,
                "role", user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Lấy thông tin emailOrUsername từ DTO mới
        String identifier = request.getEmailOrUsername();

        // Ưu tiên tìm user bằng username trước
        Optional<User> userOpt = userRepository.findByUsername(identifier);

        // Nếu không tìm thấy bằng username, thử tìm bằng email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        // Kiểm tra user có tồn tại và password có khớp không
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = tokenProvider.generateToken(user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "accessToken", token,
                    "role", user.getRole().name()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
    }

    // API RẤT QUAN TRỌNG CHO FRONTEND: Lấy thông tin Profile
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Token không hợp lệ"));
        }

        return ResponseEntity.ok(Map.of(
                "id", "U" + user.getId(), // Thêm tiền tố U cho giống ID string của Frontend
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                "role", user.getRole().name()
        ));
    }
}