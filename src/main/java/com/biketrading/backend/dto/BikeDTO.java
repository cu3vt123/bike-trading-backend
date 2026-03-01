package com.biketrading.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BikeDTO {
    @NotBlank(message = "Tên xe không được để trống")
    private String name;

    @NotNull(message = "Giá xe không được để trống")
    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal price;

    private String brand;
    private String description;
    private String category;
}