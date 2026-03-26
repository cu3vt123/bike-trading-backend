package com.bob.planb.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String id;
    private String email;
    private String displayName;
    private String role;
    private Object subscription; // Tạm để Object, ta sẽ làm chi tiết ở phần Seller sau
}