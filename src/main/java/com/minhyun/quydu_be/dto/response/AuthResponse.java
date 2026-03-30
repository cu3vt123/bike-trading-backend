package com.minhyun.quydu_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.minhyun.quydu_be.entity.UserRole;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserRole role;
    private Map<String, Object> subscription;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, String refreshToken, UserRole role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
    }

    public AuthResponse(String accessToken, String refreshToken, UserRole role, Map<String, Object> subscription) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
        this.subscription = subscription;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Map<String, Object> getSubscription() {
        return subscription;
    }

    public void setSubscription(Map<String, Object> subscription) {
        this.subscription = subscription;
    }
}
