package com.minhyun.quydu_be.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ApplicationConfig {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String corsAllowedOrigins;

    /** Thêm origin (preview deploy, LAN), ngăn cách dấu phẩy — nối sau allowed-origins. */
    @Value("${app.cors.extra-origins:}")
    private String corsExtraOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String merged = corsAllowedOrigins;
        if (corsExtraOrigins != null && !corsExtraOrigins.isBlank()) {
            merged = merged + "," + corsExtraOrigins;
        }
        String[] origins = Arrays.stream(merged.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .toArray(String[]::new);
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(origins)
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }

    /** §13.6 / §17 — ảnh lưu dưới {@code app.upload-dir}, URL {@code /uploads/**}. */
    @Bean
    public WebMvcConfigurer uploadsResourceConfigurer() {
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(root.toUri().toString());
            }
        };
    }
}
