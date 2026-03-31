package com.minhyun.quydu_be.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.minhyun.quydu_be.dto.json.FlexibleLongDeserializer;
import com.minhyun.quydu_be.entity.OrderPlan;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    /** FE có thể gửi số hoặc chuỗi số — cùng parse được. */
    @NotNull
    @JsonDeserialize(using = FlexibleLongDeserializer.class)
    private Long listingId;

    @NotNull
    private OrderPlan plan;

    @Valid
    @NotNull
    private ShippingAddressRequest shippingAddress;

    private Boolean acceptedUnverifiedDisclaimer;

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }
    public OrderPlan getPlan() { return plan; }
    public void setPlan(OrderPlan plan) { this.plan = plan; }
    public ShippingAddressRequest getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddressRequest shippingAddress) { this.shippingAddress = shippingAddress; }
    public Boolean getAcceptedUnverifiedDisclaimer() { return acceptedUnverifiedDisclaimer; }
    public void setAcceptedUnverifiedDisclaimer(Boolean acceptedUnverifiedDisclaimer) { this.acceptedUnverifiedDisclaimer = acceptedUnverifiedDisclaimer; }

    public static class ShippingAddressRequest {
        @NotBlank
        private String street;
        @NotBlank
        private String city;
        private String postalCode;

        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }
}
