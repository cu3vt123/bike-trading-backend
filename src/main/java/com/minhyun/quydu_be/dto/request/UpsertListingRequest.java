package com.minhyun.quydu_be.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

public class UpsertListingRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String brand;
    private String model;
    private Integer year;
    @DecimalMin("0.0")
    private BigDecimal price;
    private String currency;
    private String frameSize;
    /** NEW, LIKE_NEW, ... — khớp FE CreateListingRequest.condition */
    private String condition;
    private String location;
    private String description;
    private List<String> imageUrls;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getFrameSize() { return frameSize; }
    public void setFrameSize(String frameSize) { this.frameSize = frameSize; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
