package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.JwtUtils;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.services.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequiredArgsConstructor
public class RecipesController {
    private final RecipeService recipeService;

    @PostMapping("/addRecipe")
    public ResponseEntity<?> addRecipe(@RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        System.out.println(recipeDto);
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        String login = JwtUtils.getLoginFromToken(token);
        recipeService.saveRecipe(recipeDto, login);
        return ResponseEntity.ok("Added Recipe");
    }
}
