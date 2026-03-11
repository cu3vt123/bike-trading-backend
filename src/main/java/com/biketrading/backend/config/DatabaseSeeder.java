package com.biketrading.backend.config;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Inspector;
import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.InspectorRepository;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired private BuyerRepository buyerRepository;
    @Autowired private SellerRepository sellerRepository;
    @Autowired private InspectorRepository inspectorRepository;
    @Autowired private BikeRepository bikeRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String defaultPassword = passwordEncoder.encode("Password!1");

        // 1. TẠO TÀI KHOẢN SELLER MẪU
        Seller seller;
        if (sellerRepository.findByUsername("seller_demo").isEmpty()) {
            seller = new Seller();
            seller.setUsername("seller_demo");
            seller.setEmail("seller@demo.com");
            seller.setPassword(defaultPassword);
            seller.setPhone("0901234567");
            seller.setCreatedAt(LocalDateTime.now());
            sellerRepository.save(seller);
            System.out.println("Đã tạo Seller: seller_demo / Password!1");
        } else {
            seller = sellerRepository.findByUsername("seller_demo").get();
        }

        // 2. TẠO TÀI KHOẢN BUYER MẪU
        if (buyerRepository.findByUsername("buyer_demo").isEmpty()) {
            Buyer buyer = new Buyer();
            buyer.setUsername("buyer_demo");
            buyer.setEmail("buyer@demo.com");
            buyer.setPassword(defaultPassword);
            buyer.setPhone("0987654321");
            buyer.setAddress("Hồ Chí Minh");
            buyer.setCreatedAt(LocalDateTime.now());
            buyerRepository.save(buyer);
            System.out.println("Đã tạo Buyer: buyer_demo / Password!1");
        }

        // 3. TẠO TÀI KHOẢN INSPECTOR MẪU
        if (inspectorRepository.findByUsername("inspector_demo").isEmpty()) {
            Inspector inspector = new Inspector();
            inspector.setUsername("inspector_demo");
            inspector.setEmail("inspector@demo.com");
            inspector.setPassword(defaultPassword);
            inspectorRepository.save(inspector);
            System.out.println("Đã tạo Inspector: inspector_demo / Password!1");
        }

        // 4. TẠO XE MẪU NẾU DB CHƯA CÓ XE NÀO
        if (bikeRepository.count() == 0) {
            Bike bike1 = new Bike();
            bike1.setName("Specialized S-Works Tarmac SL7");
            bike1.setBrandId(1); // Giả sử 1 là Specialized
            bike1.setPrice(new BigDecimal("7200"));
            bike1.setDescription("Light, fast, aero road bike — inspected & verified");
            bike1.setFrameSize("56cm (L)");
            bike1.setSellerId(seller.getSellerId());
            bike1.setApprovalStatus("APPROVED");
            bike1.setSalesStatus("AVAILABLE");
            bikeRepository.save(bike1);

            Bike bike2 = new Bike();
            bike2.setName("Giant TCR Advanced — awaiting inspection");
            bike2.setBrandId(2); // Giả sử 2 là Giant
            bike2.setPrice(new BigDecimal("2800"));
            bike2.setDescription("Khung carbon siêu nhẹ, chờ kiểm duyệt");
            bike2.setFrameSize("52cm (S)");
            bike2.setSellerId(seller.getSellerId());
            bike2.setApprovalStatus("PENDING_INSPECTION"); // Xe đang chờ duyệt
            bike2.setSalesStatus("AVAILABLE");
            bikeRepository.save(bike2);

            System.out.println("Đã tạo dữ liệu xe đạp mẫu thành công!");
        }
    }
}