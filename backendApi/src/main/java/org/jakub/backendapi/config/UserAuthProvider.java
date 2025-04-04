package org.jakub.backendapi.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.*;

@RequiredArgsConstructor
@Component
public class UserAuthProvider {

    @Value("${security.jwt.token.secret-key:secret-key}")
    private String secretKey;

    private final UserService userService;

    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
    }

    // **Create Access Token**
    public String createToken(String login) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 1_800_000); // 30 minutes
        return JWT.create()
                .withIssuer(login)
                .withClaim("type", "access") // Custom claim to identify access token
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // **Validate Access Token**
    public Authentication validateToken(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
        DecodedJWT decodedJWT = verifier.verify(token);

        UserDto user = userService.findByLogin(decodedJWT.getIssuer());

        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
    }

    // **Create Refresh Token**
    public String createRefreshToken(String login) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 3_600_000); // 1 hour
        return JWT.create()
                .withIssuer(login)
                .withClaim("type", "refresh") // Custom claim to identify refresh token
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // **Validate Refresh Token**
    public boolean validateRefreshToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            DecodedJWT decodedJWT = verifier.verify(token);

            // Ensure the token is not expired
            return !decodedJWT.getExpiresAt().before(new Date()) && "refresh".equals(decodedJWT.getClaim("type").asString());
        } catch (Exception e) {
            return false;
        }
    }

    // **Refresh Access Token using Refresh Token**
    public String refreshAccessToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        DecodedJWT decodedJWT = JWT.decode(refreshToken);
        return createToken(decodedJWT.getIssuer()); // Generate a new access token
    }

    // **Refresh Refresh Token (Optional, if you want to issue a new refresh token)**
    public String refreshRefreshToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        DecodedJWT decodedJWT = JWT.decode(refreshToken);
        return createRefreshToken(decodedJWT.getIssuer()); // Generate a new refresh token
    }

    public ArrayList<ResponseCookie> setHttpOnlyCookie(String accessToken, String refreshToken) {
            ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(false) // Set true in production (requires HTTPS)
            .path("/")
            .maxAge(60 * 15) // 15 minutes
            .sameSite("Lax")
            .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(60 * 30) // 7 days
            .sameSite("Lax")
            .build();
        return new ArrayList<>(Arrays.asList(accessCookie, refreshCookie));
    }

}
