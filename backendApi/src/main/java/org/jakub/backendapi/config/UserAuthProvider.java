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
import org.springframework.security.authentication.BadCredentialsException; // Added import
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
    public String createToken(String email) { // Changed parameter from login to email
        UserDto userDto = userService.findByEmail(email);
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 1_800_000); // 30 minutes
        return JWT.create()
                .withIssuer(email) // Changed from login to email
                .withClaim("type", "access") // Custom claim to identify access token
                .withClaim("role", userDto.getRole().name()) // Add role to token
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // **Validate Access Token**
    public Authentication validateToken(String token) {
        DecodedJWT decodedJWT;
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            decodedJWT = verifier.verify(token);
        } catch (com.auth0.jwt.exceptions.JWTVerificationException e) {
            // Token is invalid (expired, signature mismatch, etc.)
            throw new BadCredentialsException("Invalid token", e);
        }

        String issuer = decodedJWT.getIssuer();
        if (issuer == null) {
            // Token is structurally valid but missing the issuer claim, which we rely on.
            // This indicates a problem with how the token was generated.
            // Consider logging this as a server-side error.
            throw new BadCredentialsException("Invalid token: Issuer missing.");
        }

        UserDto user = userService.findByEmail(issuer);
        // userService.findByEmail already throws AppException(404) if user not found.
        // This AppException, if it propagates to JwtAuthFilter, should lead to UserAuthenticationEntryPoint (401).

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UsernamePasswordAuthenticationToken(user, null, authorities);
    }

    // **Create Refresh Token**
    public String createRefreshToken(String email) { // Changed parameter from login to email
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 3_600_000); // 1 hour
        return JWT.create()
                .withIssuer(email) // Changed from login to email
                .withClaim("type", "refresh") // Custom claim to identify refresh token
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // **Validate Refresh Token** -> Renamed to isRefreshTokenInvalid
    public boolean isRefreshTokenInvalid(String token) {
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            DecodedJWT decodedJWT = verifier.verify(token);

            // Token is invalid if expired OR if it's not a refresh token type
            return decodedJWT.getExpiresAt().before(new Date()) || !"refresh".equals(decodedJWT.getClaim("type").asString());
        } catch (Exception e) {
            // Any exception during verification means it's invalid
            return true;
        }
    }

    // **Refresh Access Token using Refresh Token**
    public String refreshAccessToken(String refreshToken) {
        if (isRefreshTokenInvalid(refreshToken)) { // Updated call
            throw new RuntimeException("Invalid or expired refresh token");
        }

        DecodedJWT decodedJWT = JWT.decode(refreshToken);
        return createToken(decodedJWT.getIssuer()); // Generate a new access token
    }

    // **Refresh Refresh Token (Optional, if you want to issue a new refresh token)**
    public String refreshRefreshToken(String refreshToken) {
        if (isRefreshTokenInvalid(refreshToken)) { // Updated call
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
