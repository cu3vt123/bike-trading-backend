package com.biketrading.backend.config;

import com.biketrading.backend.entity.Brand;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Spec;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.Condition;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.Role;
import com.biketrading.backend.enums.SubscriptionPlan;
import com.biketrading.backend.repository.BrandRepository;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final ListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (brandRepository.count() == 0) {
            seedBrands();
        }

        if (listingRepository.count() == 0) {
            seedListings();
        }
    }

    private void seedUsers() {
        seedUser("buyer@shopbike.com", "buyer01", "Buyer Demo", Role.BUYER, null, null);
        seedUser("seller@shopbike.com", "seller01", "Seller Demo", Role.SELLER, SubscriptionPlan.BASIC, LocalDateTime.now().plusDays(30));
        seedUser("inspector@shopbike.com", "inspector01", "Inspector Demo", Role.INSPECTOR, null, null);
        seedUser("admin@shopbike.com", "admin", "Admin Demo", Role.ADMIN, null, null);
    }

    private void seedBrands() {
        createBrand("Trek", "trek");
        createBrand("Giant", "giant");
        createBrand("Specialized", "specialized");
    }

    private void seedListings() {
        User seller = userRepository.findByUsernameIgnoreCase("seller01").orElseThrow();

        Listing l1 = new Listing();
        l1.setSeller(seller);
        l1.setTitle("Trek Marlin 7 2023");
        l1.setBrand("Trek");
        l1.setModel("Marlin 7");
        l1.setYear(2023);
        l1.setPrice(new BigDecimal("18500000"));
        l1.setMsrp(new BigDecimal("22000000"));
        l1.setCurrency("VND");
        l1.setCondition(Condition.GOOD_USED);
        l1.setFrameSize("M");
        l1.setLocation("Ho Chi Minh City");
        l1.setDescription("Xe MTB đã kiểm định, phù hợp đi phố và đường nhẹ.");
        l1.setThumbnailUrl("https://images.unsplash.com/photo-1541625602330-2277a4c46182");
        l1.setImageUrls(List.of(
                "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
                "https://images.unsplash.com/photo-1511994298241-608e28f14fde"
        ));
        l1.setSpecs(List.of(spec("Frame", "Aluminum"), spec("Fork", "RockShox"), spec("Wheel Size", "29")));
        l1.setState(ListingState.PUBLISHED);
        l1.setInspectionResult(InspectionResult.APPROVE);
        l1.setInspectionScore(8.8);
        l1.setInspectionSummary("Khung tốt, truyền động ổn, phanh hoạt động tốt.");
        l1.setPublishedAt(LocalDateTime.now().minusDays(2));
        l1.setListingExpiresAt(LocalDateTime.now().plusDays(28));
        listingRepository.save(l1);

        Listing l2 = new Listing();
        l2.setSeller(seller);
        l2.setTitle("Giant Escape 2 City");
        l2.setBrand("Giant");
        l2.setModel("Escape 2");
        l2.setYear(2022);
        l2.setPrice(new BigDecimal("12900000"));
        l2.setMsrp(new BigDecimal("15500000"));
        l2.setCurrency("VND");
        l2.setCondition(Condition.LIKE_NEW);
        l2.setFrameSize("S");
        l2.setLocation("Da Nang");
        l2.setDescription("Xe city bike nhẹ, phù hợp đi học và đi làm.");
        l2.setThumbnailUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e");
        l2.setImageUrls(List.of(
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e"
        ));
        l2.setSpecs(List.of(spec("Frame", "ALUXX"), spec("Brakes", "Disc"), spec("Speed", "16")));
        l2.setState(ListingState.PUBLISHED);
        l2.setInspectionResult(InspectionResult.APPROVE);
        l2.setInspectionScore(9.2);
        l2.setInspectionSummary("Xe gần như mới, ít trầy xước.");
        l2.setPublishedAt(LocalDateTime.now().minusDays(1));
        l2.setListingExpiresAt(LocalDateTime.now().plusDays(29));
        listingRepository.save(l2);
    }

    private void createBrand(String name, String slug) {
        Brand b = new Brand();
        b.setName(name);
        b.setSlug(slug);
        b.setActive(true);
        brandRepository.save(b);
    }

    private Spec spec(String key, String value) {
        Spec s = new Spec();
        s.setKey(key);
        s.setValue(value);
        return s;
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
        user.setPasswordHash(passwordEncoder.encode("Password!1"));
        user.setSubscriptionPlan(plan);
        user.setSubscriptionExpiresAt(expiresAt);

        userRepository.save(user);
    }
}