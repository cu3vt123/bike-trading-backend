package com.biketrading.backend.dto;

import com.biketrading.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeResponse {
    private String id;
    private String email;
    private String displayName;
    private Role role;
    private SellerSubscriptionSummary subscription;
}