package com.bob.planb.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ListingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Brand is required")
    private String brand;

    private String model;
    private Integer year;
    private String frameSize;
    private String condition; // Nhận string từ client, sau đó ép kiểu sang Enum ConditionType

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private Double price;

    private String currency;
    private String location;
    private String description;
    private List<String> imageUrls;
}