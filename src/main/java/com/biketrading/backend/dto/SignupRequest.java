package com.biketrading.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Role không được để trống")
    private String role; // BUYER hoặc SELLER

    @NotBlank(message = "Username không được để trống")
    @Size(min = 2, max = 30, message = "Username phải từ 2-30 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username chỉ chứa chữ, số và dấu gạch dưới")
    private String username;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 8, max = 64, message = "Password phải từ 8-64 ký tự")
    // FE yêu cầu: ít nhất 1 chữ in hoa và 1 ký tự đặc biệt
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).*$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ in hoa và 1 ký tự đặc biệt")
    private String password;
}