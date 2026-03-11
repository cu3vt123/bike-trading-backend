package com.biketrading.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request payload")
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    @Schema(description = "Username of the user", example = "buyer_demo")
    private String username;

    @NotBlank(message = "Password không được để trống")
    @Schema(description = "Password of the user", example = "123456")
    private String password;

    @NotBlank(message = "Role không được để trống (BUYER, SELLER, INSPECTOR)")
    @Schema(description = "Role of the user (BUYER, SELLER, INSPECTOR)", example = "BUYER")
    private String role;

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}