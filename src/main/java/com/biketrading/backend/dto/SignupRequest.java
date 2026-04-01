package com.biketrading.backend.dto;

import com.biketrading.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    @NotNull(message = "Role is required.")
    private Role role;

    @Size(min = 2, max = 30, message = "Username phải từ 2 đến 30 ký tự.")
    private String username;

    @NotBlank(message = "Email is required.")
    @Email(message = "Email không hợp lệ.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 64, message = "Mật khẩu phải từ 8 đến 64 ký tự.")
    private String password;
}