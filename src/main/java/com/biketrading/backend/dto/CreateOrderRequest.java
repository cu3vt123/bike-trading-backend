package com.biketrading.backend.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Long listingId;
    private String plan; // DEPOSIT hoặc FULL
    private ShippingAddress shippingAddress;

    @Data
    public static class ShippingAddress {
        private String street;
        private String city;
        private String postalCode;
    }
}