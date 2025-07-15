package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.services.UserPreferencesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    @GetMapping("/user/getPreferences")
    public ResponseEntity<UserPreferencesDto> getPreferences(HttpServletRequest request) {
        return ResponseEntity.ok(userPreferencesService.getPreferences(getLoginFromToken(request)));
    }

    @PatchMapping("/user/patchPreferences")
    public ResponseEntity<UserPreferencesDto> patchPreferences(HttpServletRequest request, @RequestBody UserPreferencesDto preferencesDto) {
        return ResponseEntity.ok(userPreferencesService.patchPreferences(getLoginFromToken(request), preferencesDto));
    }
}

