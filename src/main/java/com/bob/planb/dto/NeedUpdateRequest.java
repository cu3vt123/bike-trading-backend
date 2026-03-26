package com.bob.planb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NeedUpdateRequest {
    @NotBlank(message = "Reason is required")
    private String reason;
}