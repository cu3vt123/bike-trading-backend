package com.biketrading.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Vui lòng nhập email hoặc tên đăng nhập.")
    private String emailOrUsername;

    @NotBlank(message = "Vui lòng nhập mật khẩu.")
    private String password;
}