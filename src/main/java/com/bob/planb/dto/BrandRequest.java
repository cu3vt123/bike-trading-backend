package com.bob.planb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandRequest {
    @NotBlank(message = "Brand name is required")
    private String name;

    private String slug;

    private Boolean active; // Dùng Boolean object để có thể check null khi update
}