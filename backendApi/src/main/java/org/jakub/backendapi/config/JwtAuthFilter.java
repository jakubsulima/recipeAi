package org.jakub.backendapi.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final UserAuthProvider userAuthProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ✅ Get token from HttpOnly cookie
        String token = getTokenFromCookies(request, "access_token");

        if (token != null) {
            try {
                SecurityContextHolder.getContext().setAuthentication(
                        userAuthProvider.validateToken(token)
                );
            } catch (RuntimeException e) {
                SecurityContextHolder.clearContext();
                // Optionally log or handle the invalid token case
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromCookies(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> name.equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }
        return null;
    }
}
