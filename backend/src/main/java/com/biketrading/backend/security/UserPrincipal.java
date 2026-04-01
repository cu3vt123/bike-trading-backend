package com.biketrading.backend.security;

import com.biketrading.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserPrincipal {
    private Long id;
    private String email;
    private String displayName;
    private Role role;
}