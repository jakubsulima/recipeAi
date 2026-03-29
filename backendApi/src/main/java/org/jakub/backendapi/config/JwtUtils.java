package org.jakub.backendapi.config;

import com.auth0.jwt.JWT;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;

@Component
public class JwtUtils {

    static public String getLoginFromToken(String token) {
        if (!StringUtils.hasText(token)) {
            return null;
        }

        try {
            return JWT.decode(token).getIssuer();
        } catch (Exception ignored) {
            return null;
        }
    }

    static public String getTokenFromCookies(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> name.equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }
        return null;
    }
    static public String getLoginFromToken(HttpServletRequest request) {
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        return JwtUtils.getLoginFromToken(token);
    }
}
