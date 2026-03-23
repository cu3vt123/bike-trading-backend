package com.biketrading.backend.dto;

import com.biketrading.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private Role role;
    private SellerSubscriptionSummary subscription;
}