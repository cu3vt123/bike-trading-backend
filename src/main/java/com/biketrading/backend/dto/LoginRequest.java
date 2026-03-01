package com.biketrading.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Login request payload")
public class LoginRequest {

    @Schema(description = "Username of seller", example = "buyer_demo")
    private String username;

    @Schema(description = "Password of seller", example = "123456")
    private String password;

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
}