package com.minhyun.quydu_be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(name = "display_name", length = 120)
    private String displayName;

    @Column(name = "is_hidden", nullable = false)
    private boolean hidden = false;

    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;

    @Column(name = "reset_password_token", length = 255)
    private String resetPasswordToken;

    @Column(name = "reset_password_expires_at")
    private LocalDateTime resetPasswordExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_plan", length = 20)
    private SubscriptionPlan subscriptionPlan;

    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public LocalDateTime getHiddenAt() {
        return hiddenAt;
    }

    public void setHiddenAt(LocalDateTime hiddenAt) {
        this.hiddenAt = hiddenAt;
    }

    public String getResetPasswordToken() {
        return resetPasswordToken;
    }

    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }

    public LocalDateTime getResetPasswordExpiresAt() {
        return resetPasswordExpiresAt;
    }

    public void setResetPasswordExpiresAt(LocalDateTime resetPasswordExpiresAt) {
        this.resetPasswordExpiresAt = resetPasswordExpiresAt;
    }

    public SubscriptionPlan getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public LocalDateTime getSubscriptionExpiresAt() {
        return subscriptionExpiresAt;
    }

    public void setSubscriptionExpiresAt(LocalDateTime subscriptionExpiresAt) {
        this.subscriptionExpiresAt = subscriptionExpiresAt;
    }
}
