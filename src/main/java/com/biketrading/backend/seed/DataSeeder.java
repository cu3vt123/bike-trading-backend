package com.biketrading.backend.seed;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.entity.Buyer;
import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.BikeRepository;
import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.SellerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final SellerRepository sellerRepository;
    private final BuyerRepository buyerRepository;
    private final BikeRepository bikeRepository;

    public DataSeeder(SellerRepository sellerRepository,
                      BuyerRepository buyerRepository,
                      BikeRepository bikeRepository) {
        this.sellerRepository = sellerRepository;
        this.buyerRepository = buyerRepository;
        this.bikeRepository = bikeRepository;
    }

    @Override
    public void run(String... args) {

        // 0) Seed users demo trước (idempotent)
        Seller s1 = ensureSeller("seller_demo_1", "Demo Shop 1", "seller1@mail.com", "0900000001");
        Seller s2 = ensureSeller("seller_demo_2", "Demo Shop 2", "seller2@mail.com", "0900000002");

        Buyer b1 = ensureBuyer("buyer_demo_1", "buyer1@mail.com", "0910000001", "HCM");

        // 1) Seed bikes (idempotent)
        if (bikeRepository.count() >= 8) {
            System.out.println("[Seeder] Bikes already seeded. Skip.");
            return;
        }

        List<Bike> bikes = new ArrayList<>();
        bikes.add(makeBike(s1.getSellerId(), 1, 1, "Giant Escape 3 2022",
                "Hybrid city bike, nhẹ, phù hợp đi học/đi làm.", "7200000", "M", 90));
        bikes.add(makeBike(s1.getSellerId(), 2, 3, "Specialized Allez 2020",
                "Road bike cho người mới, chạy êm.", "13500000", "54", 85));
        bikes.add(makeBike(s1.getSellerId(), 1, 2, "Trek FX 2 Disc 2021",
                "Fitness bike, phanh đĩa, dễ bảo dưỡng.", "9800000", "L", 88));
        bikes.add(makeBike(s1.getSellerId(), 3, 4, "Merida Big Nine 300 2021",
                "MTB 29er leo dốc ổn, đi tour nhẹ.", "11200000", "M", 82));

        bikes.add(makeBike(s2.getSellerId(), 2, 5, "Cannondale CAAD12 2019",
                "Khung nhôm xịn, sprint tốt.", "18900000", "52", 80));
        bikes.add(makeBike(s2.getSellerId(), 1, 6, "Polygon Heist X2 2022",
                "City bike, tư thế thoải mái.", "6500000", "M", 87));
        bikes.add(makeBike(s2.getSellerId(), 3, 7, "Giant Talon 2 2020",
                "MTB phổ thông, bền, dễ nâng cấp.", "8400000", "S", 84));
        bikes.add(makeBike(s2.getSellerId(), 2, 8, "Scott Speedster 40 2021",
                "Road bike entry, phù hợp luyện tập.", "12500000", "56", 83));

        bikeRepository.saveAll(bikes);
        System.out.println("[Seeder] Seeded " + bikes.size() + " bikes.");

        // 2) Optional: seed order (bạn làm bước 4 nếu cần)
        // seedSampleOrder(b1, bikes.get(0));
    }

    private Seller ensureSeller(String username, String shopName, String email, String phone) {
        return sellerRepository.findByUsername(username)
                .orElseGet(() -> {
                    Seller s = new Seller();
                    s.setUsername(username);
                    s.setPassword("123456");
                    s.setEmail(email);
                    s.setPhone(phone);
                    s.setShopName(shopName);
                    s.setReputationScore(4.7);
                    return sellerRepository.save(s);
                });
    }

    private Buyer ensureBuyer(String username, String email, String phone, String address) {
        return buyerRepository.findByUsername(username)
                .orElseGet(() -> {
                    Buyer b = new Buyer();
                    b.setUsername(username);
                    b.setPassword("123456");
                    b.setEmail(email);
                    b.setPhone(phone);
                    b.setAddress(address);
                    return buyerRepository.save(b);
                });
    }

    private Bike makeBike(Long sellerId,
                          Integer categoryId,
                          Integer brandId,
                          String name,
                          String description,
                          String price,
                          String frameSize,
                          Integer conditionPercentage) {

        Bike b = new Bike();
        b.setSellerId(sellerId);
        b.setCategoryId(null);
        b.setBrandId(null);
        b.setName(name);
        b.setDescription(description);
        b.setPrice(new BigDecimal(price));
        b.setFrameSize(frameSize);
        b.setConditionPercentage(conditionPercentage);

        // SHOP-32: published listings
        b.setApprovalStatus("APPROVED");
        b.setSalesStatus("AVAILABLE");
        b.setIsVerified(true);
        return b;
    }
}