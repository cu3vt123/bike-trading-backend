package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.service.PackageService;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PackageServiceImpl implements PackageService {

    private static final int LISTING_DURATION_DAYS = 30;
    private static final int BASIC_PRICE = 99_000;
    private static final int VIP_PRICE = 199_000;

    @Override
    public Map<String, Object> getPackagesCatalog() {
        return Map.of(
            "listingDurationDays", LISTING_DURATION_DAYS,
            "paymentProviders", List.of(
                Map.of(
                    "id", "VNPAY",
                    "name", "VNPay",
                    "docsUrl", "https://sandbox.vnpayment.vn/apis/",
                    "note", "Thanh toan qua cong VNPAY."
                )
            ),
            "plans", List.of(
                Map.of(
                    "id", "BASIC",
                    "name", "basic",
                    "maxConcurrentListings", 3,
                    "priceVnd", BASIC_PRICE,
                    "description", "Goi co ban cho nguoi ban moi."
                ),
                Map.of(
                    "id", "VIP",
                    "name", "vip",
                    "maxConcurrentListings", 20,
                    "priceVnd", VIP_PRICE,
                    "description", "Goi VIP voi uu tien hien thi va gioi han cao hon."
                )
            ),
            "demoCallbackHint", "http://localhost:5173/seller/packages?mockPay="
        );
    }
}
