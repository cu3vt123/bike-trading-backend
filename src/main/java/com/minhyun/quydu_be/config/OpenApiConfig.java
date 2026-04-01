package com.minhyun.quydu_be.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI quyduOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("Quydu API")
                .description("ShopBike / quydu12-compatible REST backend (Spring Boot). Dùng JWT: đăng nhập rồi Authorize với Bearer token.")
                .version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList(BEARER))
            .components(new Components().addSecuritySchemes(BEARER,
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Paste access token từ POST /api/auth/login hoặc /api/auth/refresh")));
    }
}
