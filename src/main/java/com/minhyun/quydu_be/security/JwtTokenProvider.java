package com.minhyun.quydu_be.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final String CLAIM_TYP = "typ";
    private static final String TYP_ACCESS = "access";
    private static final String TYP_REFRESH = "refresh";

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt-refresh-expiration-ms:2592000000}")
    private long jwtRefreshExpirationMs;

    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .setSubject(String.valueOf(userId))
            .claim(CLAIM_TYP, TYP_ACCESS)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /** Refresh JWT — chỉ dùng cho POST /api/auth/refresh; TTL dài hơn access. */
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationMs);
        return Jwts.builder()
            .setSubject(String.valueOf(userId))
            .claim(CLAIM_TYP, TYP_REFRESH)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    /** Bearer access: chấp nhận token có typ=access hoặc token cũ không có typ (đã phát hành trước khi có refresh). */
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            Object typ = claims.get(CLAIM_TYP);
            if (TYP_REFRESH.equals(typ)) {
                return false;
            }
            return typ == null || TYP_ACCESS.equals(typ);
        } catch (Exception ex) {
            return false;
        }
    }

    public Long validateRefreshTokenAndGetUserId(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!TYP_REFRESH.equals(claims.get(CLAIM_TYP))) {
                return null;
            }
            return Long.valueOf(claims.getSubject());
        } catch (Exception ex) {
            return null;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
