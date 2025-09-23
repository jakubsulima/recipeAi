package org.jakub.backendapi.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final UserAuthProvider userAuthProvider;

    public JwtAuthFilter(UserAuthProvider userAuthProvider) {
        this.userAuthProvider = userAuthProvider;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ✅ Get token from HttpOnly cookie
        String token = JwtUtils.getTokenFromCookies(request, "access_token");

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


}
