package com.biketrading.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String role; // BUYER, SELLER, INSPECTOR, ADMIN
    private String emailOrUsername; // Frontend sẽ gửi trường này thay vì chỉ username
    private String password;
}