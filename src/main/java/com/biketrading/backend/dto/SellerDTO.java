package com.biketrading.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SellerDTO {
    @NotBlank(message = "Username không được để trống!")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống!")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên!")
    private String password;

    @Email(message = "Email không đúng định dạng!")
    @NotBlank(message = "Email không được để trống!")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống!")
    private String phone;

    private String shopName;
}