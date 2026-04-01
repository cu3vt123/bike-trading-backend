package com.minhyun.quydu_be.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.minhyun.quydu_be.entity.UserRole;
import java.util.Map;
public class MeResponse {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String email;
    private String displayName;
    private UserRole role;
    private Map<String, Object> subscription;

    public MeResponse() {
    }

    public MeResponse(Long id, String email, String displayName, UserRole role, Map<String, Object> subscription) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.subscription = subscription;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
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
