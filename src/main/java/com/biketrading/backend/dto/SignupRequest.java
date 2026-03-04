package com.biketrading.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String role; // FE sẽ gửi "BUYER" hoặc "SELLER"
    private String username;
    private String email;
    private String password;
    private String phone;
    private String address;
}