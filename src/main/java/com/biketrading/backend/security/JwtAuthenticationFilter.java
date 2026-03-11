package com.biketrading.backend.security;

import com.biketrading.backend.repository.BuyerRepository;
import com.biketrading.backend.repository.InspectorRepository;
import com.biketrading.backend.repository.SellerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private BuyerRepository buyerRepository;
    @Autowired private SellerRepository sellerRepository;
    @Autowired private InspectorRepository inspectorRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Lấy Token từ Request (nằm trong header "Authorization")
            String jwt = getJwtFromRequest(request);

            // 2. Nếu Token hợp lệ
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);

                // 3. XÁC ĐỊNH ROLE TỪ DATABASE (Thay vì để ArrayList rỗng như trước)
                List<GrantedAuthority> authorities = new ArrayList<>();
                if (sellerRepository.findByUsername(username).isPresent()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_SELLER"));
                } else if (buyerRepository.findByUsername(username).isPresent()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_BUYER"));
                } else if (inspectorRepository.findByUsername(username).isPresent()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_INSPECTOR"));
                }

                // 4. Set thông tin User + Role vào hệ thống Security
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}