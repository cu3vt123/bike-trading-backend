package com.biketrading.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull
    private Long listingId;

    @NotBlank
    private String plan;

    @NotNull
    private ShippingAddress shippingAddress;

    private Boolean acceptedUnverifiedDisclaimer;

    @Data
    public static class ShippingAddress {
        private String street;
        private String city;
        private String postalCode;
    }
}
