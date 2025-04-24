package org.jakub.backendapi.config;

import com.auth0.jwt.JWT;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class JwtUtils {

    @Value("${security.jwt.token.secret-key:secret-key}")
    private String secretKey;

    static public String getLoginFromToken(String token) {
        return JWT.decode(token).getIssuer();
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
}
