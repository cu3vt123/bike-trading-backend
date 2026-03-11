package com.biketrading.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Thay url này nếu FE của bạn chạy port khác
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. CÁC API CÔNG KHAI (Không cần Token)
                        .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bikes/**").permitAll()

                        // 2. PHÂN QUYỀN (ROLE-BASED ACCESS CONTROL)
                        // Chỉ Seller mới được gọi các API bắt đầu bằng /api/seller/
                        .requestMatchers("/api/seller/**").hasRole("SELLER")

                        // Chỉ Buyer mới được gọi các API bắt đầu bằng /api/buyer/
                        .requestMatchers("/api/buyer/**").hasRole("BUYER")

                        // Chỉ Inspector mới được gọi các API bắt đầu bằng /api/inspector/
                        .requestMatchers("/api/inspector/**").hasRole("INSPECTOR")

                        // 3. TẤT CẢ CÁC API CÒN LẠI ĐỀU PHẢI CÓ TOKEN HỢP LỆ
                        .anyRequest().authenticated()
                );

        // Chèn bộ lọc JWT vào trước bộ lọc mặc định
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}