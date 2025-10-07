package org.jakub.backendapi.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class UserAuthProvider {

    @Value("${security.jwt.token.secret-key:secret-key}")
    private String secretKey;

    private final UserService userService;

    public UserAuthProvider(UserService userService) {
        this.userService = userService;
    }

    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
    }

    public String createToken(String email) {
        UserDto userDto = userService.findByEmail(email);
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 259_200_000);
        return JWT.create()
                .withIssuer(email)
                .withClaim("type", "access")
                .withClaim("role", userDto.getRole().name())
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    public Authentication validateToken(String token) {
        DecodedJWT decodedJWT;
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            decodedJWT = verifier.verify(token);
        } catch (com.auth0.jwt.exceptions.JWTVerificationException e) {
            throw new BadCredentialsException("Invalid token", e);
        }

        String issuer = decodedJWT.getIssuer();
        if (issuer == null) {
            throw new BadCredentialsException("Invalid token: Issuer missing.");
        }

        UserDto user = userService.findByEmail(issuer);

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UsernamePasswordAuthenticationToken(user, null, authorities);
    }

    public String createRefreshToken(String email) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 604_800_000); // 7 days
        return JWT.create()
                .withIssuer(email)
                .withClaim("type", "refresh")
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC256(secretKey));
    }

    public boolean isRefreshTokenInvalid(String token) {
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            DecodedJWT decodedJWT = verifier.verify(token);

            return decodedJWT.getExpiresAt().before(new Date()) || !"refresh".equals(decodedJWT.getClaim("type").asString());
        } catch (Exception e) {
            return true;
        }
    }

    public String refreshAccessToken(String refreshToken) {
        if (isRefreshTokenInvalid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        DecodedJWT decodedJWT = JWT.decode(refreshToken);
        return createToken(decodedJWT.getIssuer());
    }

    public String refreshRefreshToken(String refreshToken) {
        if (isRefreshTokenInvalid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        DecodedJWT decodedJWT = JWT.decode(refreshToken);
        return createRefreshToken(decodedJWT.getIssuer());
    }

    public ArrayList<ResponseCookie> setHttpOnlyCookie(String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(3 * 24 * 60 * 60) // 3 days (matching token expiry)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days (matching token expiry)
                .sameSite("Lax")
                .build();
        return new ArrayList<>(Arrays.asList(accessCookie, refreshCookie));
    }

}
