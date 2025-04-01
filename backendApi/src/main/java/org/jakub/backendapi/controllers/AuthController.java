package org.jakub.backendapi.controllers;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.UserAuthProvider;
import org.jakub.backendapi.dto.CredentialsDto;
import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class AuthController {

    private final UserService userService;
    private final UserAuthProvider userAuthProvider;

    // Login endpoint: generates an access token and refresh token
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody CredentialsDto credentialsDto) {
        UserDto user = userService.login(credentialsDto);

        user.setToken(userAuthProvider.createToken(user.getLogin()));  // Access token
        user.setRefreshToken(userAuthProvider.createRefreshToken(user.getLogin()));  // Refresh token
        return ResponseEntity.ok(user);
    }

    // Register endpoint: generates an access token and refresh token
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody SignUpDto signUpDto) {
        UserDto user = userService.register(signUpDto);
        user.setToken(userAuthProvider.createToken(user.getLogin()));  // Access token
        user.setRefreshToken(userAuthProvider.createRefreshToken(user.getLogin()));  // Refresh token
        return ResponseEntity.created(URI.create("/users/" + user.getId())).body(user);
    }

    // Refresh token endpoint: Accepts refresh token from Authorization header and returns new tokens
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authorization header is missing or invalid"));
        }

        // Extract the refresh token from the Authorization header
        String refreshToken = authHeader.substring(7);  // Remove the "Bearer " prefix

        try {
            // Generate new access and refresh tokens
            String newAccessToken = userAuthProvider.refreshAccessToken(refreshToken);
            String newRefreshToken = userAuthProvider.refreshRefreshToken(refreshToken);
            return ResponseEntity.ok(Map.of("access_token", newAccessToken, "refresh_token", newRefreshToken));

        } catch (Exception e) {
            // Handle the invalid token case
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired refresh token"));
        }
    }
}

