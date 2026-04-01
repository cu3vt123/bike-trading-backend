package com.bob.planb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Status is required")
    private String status; // SHIPPED, DELIVERED, CANCELLED...
}