package com.minhyun.quydu_be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ShippingAddress {

    @Column(name = "shipping_street", length = 255)
    private String street;

    @Column(name = "shipping_city", length = 120)
    private String city;

    @Column(name = "shipping_postal_code", length = 50)
    private String postalCode;

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
}
