package com.minhyun.quydu_be.config;

import com.minhyun.quydu_be.entity.Brand;
import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.entity.SubscriptionPlan;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.entity.UserRole;
import com.minhyun.quydu_be.repository.BrandRepository;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData(
        UserRepository userRepository,
        BrandRepository brandRepository,
        ListingRepository listingRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed-demo-listing:true}") boolean seedDemoListing
    ) {
        return args -> {
            upsertDemoUser(userRepository, passwordEncoder, "admin@demo.com", "Admin Demo", UserRole.ADMIN, false);
            upsertDemoUser(userRepository, passwordEncoder, "buyer@demo.com", "Buyer Demo", UserRole.BUYER, false);
            upsertDemoUser(userRepository, passwordEncoder, "seller@demo.com", "Seller Demo", UserRole.SELLER, true);
            upsertDemoUser(userRepository, passwordEncoder, "inspector@demo.com", "Inspector Demo", UserRole.INSPECTOR, false);

            List<String> defaultBrands = List.of(
                "Giant",
                "Trek",
                "Specialized",
                "Cannondale",
                "Scott",
                "Bianchi",
                "Canyon",
                "Santa Cruz",
                "Merida",
                "Other"
            );
            for (String brandName : defaultBrands) {
                if (brandRepository.findByNameIgnoreCase(brandName).isEmpty()) {
                    Brand b = new Brand();
                    b.setName(brandName);
                    b.setSlug(brandName.toLowerCase().replace(" ", "-"));
                    b.setActive(true);
                    brandRepository.save(b);
                }
            }

            if (seedDemoListing && listingRepository.count() == 0) {
                User seller = userRepository.findByEmailIgnoreCase("seller@demo.com").orElse(null);
                if (seller != null) {
                    Listing l = new Listing();
                    l.setTitle("Trek Emonda SL6 - Demo");
                    l.setBrand("Trek");
                    l.setModel("Emonda SL6");
                    l.setYear(2023);
                    l.setFrameSize("M");
                    l.setPrice(new BigDecimal("42000000"));
                    l.setCurrency("VND");
                    l.setLocation("Ho Chi Minh");
                    l.setDescription("Xe demo cho flow frontend/backend.");
                    l.setImageUrls(List.of(
                        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200"
                    ));
                    l.setThumbnailUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200");
                    l.setSeller(seller);
                    l.setState(ListingState.PUBLISHED);
                    l.setCertificationStatus("UNVERIFIED");
                    l.setPublishedAt(LocalDateTime.now());
                    l.setListingExpiresAt(LocalDateTime.now().plusDays(30));
                    listingRepository.save(l);
                }
            }
        };
    }

    private void upsertDemoUser(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        String email,
        String displayName,
        UserRole role,
        boolean withVipSubscription
    ) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setRole(role);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode("Password!1"));
        }
        if (withVipSubscription) {
            user.setSubscriptionPlan(SubscriptionPlan.VIP);
            if (user.getSubscriptionExpiresAt() == null || user.getSubscriptionExpiresAt().isBefore(LocalDateTime.now())) {
                user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
            }
        }
        userRepository.save(user);
    }
}
