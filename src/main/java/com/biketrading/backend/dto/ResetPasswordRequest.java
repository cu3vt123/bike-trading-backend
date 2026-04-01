package com.biketrading.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required.")
    @Size(min = 10, message = "Token không hợp lệ.")
    private String token;

    @NotBlank(message = "New password is required.")
    @Size(min = 8, max = 64, message = "Mật khẩu mới phải từ 8 đến 64 ký tự.")
    private String newPassword;
}