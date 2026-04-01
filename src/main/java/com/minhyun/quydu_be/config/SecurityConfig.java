package com.minhyun.quydu_be.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhyun.quydu_be.exception.ErrorResponse;
import com.minhyun.quydu_be.security.CustomUserDetails;
import com.minhyun.quydu_be.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final String MSG_BUYER_OR_ADMIN =
        "Access denied: endpoint requires role BUYER or ADMIN. Log in with a buyer account to checkout "
            + "(do not use seller-only or inspector session for this API).";

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.accessDeniedHandler((request, response, accessDeniedException) -> {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                String message = MSG_BUYER_OR_ADMIN;
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null
                    && auth.isAuthenticated()
                    && auth.getPrincipal() instanceof CustomUserDetails ud) {
                    message += " Backend sees role: " + ud.getRole().name()
                        + " (from DB for this access token). If FE shows buyer but this is SELLER, log out and login"
                        + " as buyer, or ensure the client sends the access token from that login (not refresh token only).";
                }
                ErrorResponse body = new ErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.FORBIDDEN.value(),
                    HttpStatus.FORBIDDEN.getReasonPhrase(),
                    message,
                    request.getRequestURI()
                );
                objectMapper.writeValue(response.getWriter(), body);
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/v3/api-docs",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/swagger-ui/**"
                ).permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/payment/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bikes/**", "/api/brands/**", "/api/packages/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
