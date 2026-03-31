package com.minhyun.quydu_be.config;

import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.entity.UserRole;
import com.minhyun.quydu_be.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Profile {@code local} only: ensures one BUYER exists for checkout / VNPAY tests.
 * Production: activate another profile (e.g. {@code prod}) so this bean is not loaded.
 */
@Component
@Profile("local")
public class LocalDevDataBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDevDataBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDevDataBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = "buyer@local.dev";
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Buyer@123"));
        user.setRole(UserRole.BUYER);
        user.setDisplayName("Local Buyer");
        userRepository.save(user);
        log.warn(
            "[local] Created BUYER test account — email: {}  password: Buyer@123  (login then call vnpay-checkout; do not use a SELLER session).",
            email
        );
    }
}
