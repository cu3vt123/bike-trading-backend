package com.biketrading.backend.config;

import com.biketrading.backend.entity.*;
import com.biketrading.backend.enums.*;
import com.biketrading.backend.repository.BrandRepository;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final BrandRepository brandRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, ListingRepository listingRepository, BrandRepository brandRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.brandRepository = brandRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedBrands();
        seedUsersAndListings();
    }

    private void seedBrands() {
        if (brandRepository.count() > 0) return;
        for (String name : List.of("Specialized", "Trek", "Giant", "Cannondale", "Santa Cruz")) {
            Brand b = new Brand();
            b.setName(name);
            b.setSlug(name.toLowerCase().replace(" ", "-"));
            b.setActive(true);
            brandRepository.save(b);
        }
    }

    private void seedUsersAndListings() {
        String pw = passwordEncoder.encode("Password!1");

        User admin = userRepository.findByUsername("admin").orElseGet(() -> saveUser("admin", "admin@shopbike.com", "Admin", UserRole.ADMIN, pw, SubscriptionPlan.FREE, 0));
        User inspector = userRepository.findByUsername("inspector01").orElseGet(() -> saveUser("inspector01", "inspector@shopbike.com", "Inspector", UserRole.INSPECTOR, pw, SubscriptionPlan.FREE, 0));
        User seller = userRepository.findByUsername("seller01").orElseGet(() -> {
            User u = saveUser("seller01", "seller@shopbike.com", "Seller Demo", UserRole.SELLER, pw, SubscriptionPlan.BASIC, 7);
            u.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(14));
            return userRepository.save(u);
        });
        User buyer = userRepository.findByUsername("buyer01").orElseGet(() -> saveUser("buyer01", "buyer@shopbike.com", "Buyer Demo", UserRole.BUYER, pw, SubscriptionPlan.FREE, 0));

        if (listingRepository.count() == 0) {
            Listing l1 = new Listing();
            l1.setSeller(seller);
            l1.setTitle("Specialized Tarmac SL7 2022");
            l1.setBrand("Specialized");
            l1.setModel("Tarmac SL7");
            l1.setYear(2022);
            l1.setFrameSize("54cm");
            l1.setCondition(Condition.LIKE_NEW);
            l1.setPrice(new BigDecimal("120000000"));
            l1.setMsrp(new BigDecimal("145000000"));
            l1.setCurrency("VND");
            l1.setLocation("Ho Chi Minh City");
            l1.setDescription("Xe carbon, groupset Ultegra Di2, demo listing certified.");
            l1.setThumbnailUrl("https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80");
            l1.setImageUrls(List.of(
                    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
                    "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80"
            ));
            Spec s1 = new Spec(); s1.setLabel("Frame"); s1.setValue("Carbon");
            Spec s2 = new Spec(); s2.setLabel("Groupset"); s2.setValue("Ultegra Di2");
            l1.setSpecs(List.of(s1, s2));
            l1.setState(ListingState.PUBLISHED);
            l1.setInspectionResult(InspectionResult.APPROVE);
            l1.setInspectionScore(4.8);
            l1.setCertificationStatus(CertificationStatus.CERTIFIED);
            l1.setPublishedAt(LocalDateTime.now().minusDays(2));
            l1.setListingExpiresAt(LocalDateTime.now().plusDays(28));
            listingRepository.save(l1);

            Listing l2 = new Listing();
            l2.setSeller(seller);
            l2.setTitle("Trek Emonda SL6 2021");
            l2.setBrand("Trek");
            l2.setModel("Emonda SL6");
            l2.setYear(2021);
            l2.setFrameSize("52cm");
            l2.setCondition(Condition.GOOD_USED);
            l2.setPrice(new BigDecimal("65000000"));
            l2.setCurrency("VND");
            l2.setLocation("Da Nang");
            l2.setDescription("Unverified demo listing.");
            l2.setThumbnailUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80");
            l2.setImageUrls(List.of("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"));
            l2.setState(ListingState.PUBLISHED);
            l2.setCertificationStatus(CertificationStatus.UNVERIFIED);
            l2.setPublishedAt(LocalDateTime.now().minusDays(1));
            l2.setListingExpiresAt(LocalDateTime.now().plusDays(29));
            listingRepository.save(l2);
        }
    }

    private User saveUser(String username, String email, String displayName, UserRole role, String password, SubscriptionPlan plan, int slots) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setDisplayName(displayName);
        u.setRole(role);
        u.setPassword(password);
        u.setSubscriptionPlan(plan);
        u.setPublishedSlotsLimit(slots);
        return userRepository.save(u);
    }
}
