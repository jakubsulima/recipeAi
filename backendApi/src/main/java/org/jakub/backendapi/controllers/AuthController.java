package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.JwtUtils;
import org.jakub.backendapi.config.UserAuthProvider;
import org.jakub.backendapi.dto.CredentialsDto;
import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.dto.ErrorDto; // Added import
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.services.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus; // Added import
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
    public ResponseEntity<UserDto> login(@Valid @RequestBody CredentialsDto credentialsDto, HttpServletResponse response) {
        UserDto user = userService.login(credentialsDto);

        CreateToken(response, user.getEmail()); // Pass email directly

        return ResponseEntity.ok(user);
    }

    // Register endpoint: generates an access token and refresh token
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody SignUpDto signUpDto, HttpServletResponse response) {
        UserDto user = userService.register(signUpDto);
        CreateToken(response, user.getEmail()); // Pass email directly

        return ResponseEntity.created(URI.create("/users/" + user.getId())).body(user);
    }

    private void CreateToken(HttpServletResponse response, String email) {
        String accessToken = userAuthProvider.createToken(email);
        String refreshToken = userAuthProvider.createRefreshToken(email);

        ArrayList<ResponseCookie> tokens = userAuthProvider.setHttpOnlyCookie(accessToken, refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(0).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, tokens.get(1).toString());
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

    @GetMapping("/me")
    public ResponseEntity<?> getUser(HttpServletRequest request) { // Changed return type to ResponseEntity<?>
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        if (token == null) {
            // It's better to return 401 if authentication is expected but no token is provided for /me
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(new ErrorDto("Access token missing."));
        }

        String emailFromToken = JwtUtils.getLoginFromToken(token); // 'getLoginFromToken' actually returns the issuer/email

        if (emailFromToken == null) {
            // This means the token's issuer was null, which is an invalid state for an access token.
            // Log this as a server-side issue (token should always have an issuer).
            System.err.println("Critical: Access token found with null issuer."); // Replace with proper logging
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(new ErrorDto("Invalid token: User identifier missing."));
        }

        try {
            UserDto userDto = userService.findByEmail(emailFromToken);
            return ResponseEntity.ok(userDto);
        } catch (AppException e) {
            // Handle cases where user might not be found based on a valid-looking email from token (e.g., user deleted after token issuance)
            return ResponseEntity.status(e.getCode() != null ? e.getCode() : HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ErrorDto(e.getMessage()));
        }
    }

}
