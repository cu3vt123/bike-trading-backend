package com.biketrading.backend.config;

import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        seedUser("buyer@shopbike.local", "buyer01", "Buyer Demo", Role.BUYER, null, null);
        seedUser("seller@shopbike.local", "seller01", "Seller Demo", Role.SELLER, SubscriptionPlan.BASIC, LocalDateTime.now().plusDays(30));
        seedUser("inspector@shopbike.local", "inspector01", "Inspector Demo", Role.INSPECTOR, null, null);
        seedUser("admin@shopbike.local", "admin01", "Admin Demo", Role.ADMIN, null, null);
    }

    private void seedUser(String email,
                          String username,
                          String displayName,
                          Role role,
                          SubscriptionPlan plan,
                          LocalDateTime expiresAt) {

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setSubscriptionPlan(plan);
        user.setSubscriptionExpiresAt(expiresAt);

        userRepository.save(user);
    }
}