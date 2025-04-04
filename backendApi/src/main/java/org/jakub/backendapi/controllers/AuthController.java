package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.UserAuthProvider;
import org.jakub.backendapi.dto.CredentialsDto;
import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.services.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.ArrayList;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class AuthController {

    private final UserService userService;
    private final UserAuthProvider userAuthProvider;

    // Login endpoint: generates an access token and refresh token
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody CredentialsDto credentialsDto, HttpServletResponse response) {
        UserDto user = userService.login(credentialsDto);

        String accessToken = userAuthProvider.createToken(user.getLogin());
        String refreshToken = userAuthProvider.createRefreshToken(user.getLogin());

        ArrayList<ResponseCookie> tokens = userAuthProvider.setHttpOnlyCookie(accessToken, refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(0).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(1).toString());

        return ResponseEntity.ok(user);
    }

    // Register endpoint: generates an access token and refresh token
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody SignUpDto signUpDto, HttpServletResponse response) {
        UserDto user = userService.register(signUpDto);
        String accessToken = userAuthProvider.createToken(user.getLogin());
        String refreshToken = userAuthProvider.createRefreshToken(user.getLogin());

        ArrayList<ResponseCookie> tokens = userAuthProvider.setHttpOnlyCookie(accessToken, refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(0).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(1).toString());

        return ResponseEntity.created(URI.create("/users/" + user.getId())).body(user);
    }

    // Refresh token endpoint: Accepts refresh token from Authorization header and returns new tokens
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refresh_token", required = false) String refreshToken,
                                          HttpServletResponse response) {
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing refresh token cookie"));
        }

        try {
            String newAccessToken = userAuthProvider.refreshAccessToken(refreshToken);
            String newRefreshToken = userAuthProvider.refreshRefreshToken(refreshToken);

            ArrayList<ResponseCookie> tokens = userAuthProvider.setHttpOnlyCookie(newAccessToken, refreshToken);

            response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(0).toString());
            response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(1).toString());

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired refresh token"));
        }
}
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        return ResponseEntity.ok().body(Map.of("message", "Logged out successfully"));
    }

}

