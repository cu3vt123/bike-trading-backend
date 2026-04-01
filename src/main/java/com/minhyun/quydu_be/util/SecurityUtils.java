package com.minhyun.quydu_be.util;

import com.minhyun.quydu_be.exception.UnauthorizedException;
import com.minhyun.quydu_be.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("Missing authenticated user");
        }
        return userDetails.getId();
    }
}
