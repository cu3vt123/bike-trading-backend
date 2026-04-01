package com.bob.planb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotBlank(message = "Plan is required (DEPOSIT or FULL)")
    private String plan; // "DEPOSIT" (Đặt cọc) hoặc "FULL" (Thanh toán 100%)

    // Xác nhận rủi ro khi mua xe chưa kiểm định
    private Boolean acceptedUnverifiedDisclaimer;

    @NotNull(message = "Shipping address is required")
    private ShippingAddressDto shippingAddress;

    // FE gửi lên dạng Object { street: "...", city: "..." }
    @Data
    public static class ShippingAddressDto {
        @NotBlank(message = "Street is required")
        private String street;

        @NotBlank(message = "City is required")
        private String city;
    }
}