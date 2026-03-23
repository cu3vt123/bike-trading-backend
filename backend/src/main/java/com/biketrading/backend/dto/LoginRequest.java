package com.biketrading.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String emailOrUsername;

    @NotBlank
    private String password;
}
