package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.Enums.Diet;
import org.jakub.backendapi.services.UserPreferencesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    public UserPreferencesController(UserPreferencesService userPreferencesService) {
        this.userPreferencesService = userPreferencesService;
    }

    @GetMapping("/user/getPreferences")
    public ResponseEntity<UserPreferencesDto> getPreferences(HttpServletRequest request) {
        return ResponseEntity.ok(userPreferencesService.getPreferences(getLoginFromToken(request)));
    }

    @PostMapping("/user/changeDiet")
    public ResponseEntity<UserPreferencesDto> changeDiet(HttpServletRequest request, @RequestBody String diet) {
        return ResponseEntity.ok(userPreferencesService.changeDiet(getLoginFromToken(request), diet));
    }

    @PostMapping("/user/addDislikedIngredient")
    public ResponseEntity<UserPreferencesDto> addDislikedIngredients(HttpServletRequest request, @RequestBody String ingredient) {
        return ResponseEntity.ok(userPreferencesService.addDislikedIngredient(getLoginFromToken(request), ingredient));
    }

    @PostMapping("/user/removeDislikedIngredient")
    public ResponseEntity<UserPreferencesDto> removeDislikedIngredients(HttpServletRequest request, @RequestBody String ingredient) {
        return ResponseEntity.ok(userPreferencesService.removeDislikedIngredient(getLoginFromToken(request), ingredient));
    }

    @GetMapping("/user/getDiets")
    public ResponseEntity<Diet[]> getDiets() {
        return ResponseEntity.ok(userPreferencesService.getDiets());
    }
}
