package com.biketrading.backend.config;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.Condition;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.UserRole;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ListingRepository listingRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String defaultPassword = passwordEncoder.encode("Password!1");
        // 0. Tạo Admin
        if (userRepository.findByUsername("admin01").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin01");
            admin.setEmail("admin@shopbike.com");
            admin.setPassword(defaultPassword);
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println(">> Đã tạo Admin: admin01 / Password!1");
        }


        // 1. Tạo Inspector (Người kiểm định)
        if (userRepository.findByUsername("inspector01").isEmpty()) {
            User inspector = new User();
            inspector.setUsername("inspector01");
            inspector.setEmail("inspector@shopbike.com");
            inspector.setPassword(defaultPassword);
            inspector.setRole(UserRole.INSPECTOR);
            userRepository.save(inspector);
            System.out.println(">> Đã tạo Inspector: inspector01 / Password!1");
        }

        // 2. Tạo Seller (Người bán)
        User seller;
        if (userRepository.findByUsername("seller01").isEmpty()) {
            seller = new User();
            seller.setUsername("seller01");
            seller.setEmail("seller@shopbike.com");
            seller.setPassword(defaultPassword);
            seller.setRole(UserRole.SELLER);
            userRepository.save(seller);
            System.out.println(">> Đã tạo Seller: seller01 / Password!1");
        } else {
            seller = userRepository.findByUsername("seller01").get();
        }

        // 3. Tạo Buyer (Người mua)
        if (userRepository.findByUsername("buyer01").isEmpty()) {
            User buyer = new User();
            buyer.setUsername("buyer01");
            buyer.setEmail("buyer@shopbike.com");
            buyer.setPassword(defaultPassword);
            buyer.setRole(UserRole.BUYER);
            userRepository.save(buyer);
            System.out.println(">> Đã tạo Buyer: buyer01 / Password!1");
        }

        // 4. Tạo xe mẫu (Đã duyệt để hiện lên trang chủ luôn)
        if (listingRepository.count() == 0) {
            Listing bike1 = new Listing();
            bike1.setTitle("Specialized Tarmac SL7 2022");
            bike1.setBrand("Specialized");
            bike1.setModel("Tarmac SL7");
            bike1.setYear(2022);
            bike1.setPrice(new BigDecimal("120000000")); // 120 triệu VND
            bike1.setCurrency("VND");
            bike1.setCondition(Condition.LIKE_NEW);
            bike1.setFrameSize("54cm");
            bike1.setLocation("Hồ Chí Minh");
            bike1.setDescription("Xe còn rất mới, full carbon, Group Ultegra Di2.");
            bike1.setThumbnailUrl("https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&q=80"); // Ảnh xe đạp mượn tạm
            bike1.setImageUrls(List.of("https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80"));

            // Trạng thái đã duyệt
            bike1.setState(ListingState.PUBLISHED);
            bike1.setInspectionResult(InspectionResult.APPROVE);
            bike1.setInspectionScore(4.8);
            bike1.setSeller(seller);

            listingRepository.save(bike1);
            System.out.println(">> Đã tạo tin đăng xe mẫu thành công!");
        }
    }
}