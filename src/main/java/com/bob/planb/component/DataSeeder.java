package com.bob.planb.component;

import com.bob.planb.entity.SubscriptionPackage;
import com.bob.planb.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PackageRepository packageRepository;

    @Override
    public void run(String... args) {
        if (packageRepository.count() == 0) {
            SubscriptionPackage p1 = SubscriptionPackage.builder()
                    .name("Gói Thành Viên Đồng")
                    .price(50000.0)
                    .limitPost(5)
                    .durationDays(30)
                    .build();

            SubscriptionPackage p2 = SubscriptionPackage.builder()
                    .name("Gói VIP Vàng")
                    .price(250000.0)
                    .limitPost(100)
                    .durationDays(90)
                    .build();

            packageRepository.saveAll(Arrays.asList(p1, p2));
            System.out.println(">> Đã nạp danh sách Gói hội viên mẫu thành công.");
        }
    }
}