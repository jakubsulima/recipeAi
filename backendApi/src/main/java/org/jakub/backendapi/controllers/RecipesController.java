package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.JwtUtils;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.services.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequiredArgsConstructor
public class RecipesController {
    private final RecipeService recipeService;

    @PostMapping("/addRecipe")
    public ResponseEntity<RecipeDto> addRecipe(@RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        String login = JwtUtils.getLoginFromToken(token);
        recipeService.saveRecipe(recipeDto, login);
        return ResponseEntity.ok(recipeDto);
    }

    @GetMapping("/getAllRecipes")
    public ResponseEntity<RecipeDto[]> getAllRecipes() {
        RecipeDto[] recipes = recipeService.getAllRecipes().toArray(new RecipeDto[0]);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/getRecipe/{id}")
    public ResponseEntity<RecipeDto> getRecipe(@PathVariable Long id, HttpServletRequest request) {
        RecipeDto recipe = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/getRecipeByName/{name}")
    public ResponseEntity<RecipeDto> getRecipeByName(@PathVariable String name) {
        RecipeDto recipe = recipeService.getRecipeByName(name);
        return ResponseEntity.ok(recipe);
    }

    @PostMapping("/deleteRecipe/{id}")
    public ResponseEntity<RecipeResponseDto> deleteRecipe(@PathVariable Long id, HttpServletRequest request) {
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        String login = JwtUtils.getLoginFromToken(token);
        RecipeResponseDto recipeResponseDto = recipeService.deleteRecipe(id, login);
        return ResponseEntity.ok(recipeResponseDto);
    }

    @GetMapping("/getUserRecipes/{userId}")
    public ResponseEntity<List<RecipeDto>> getUserRecipes(@PathVariable long userId, HttpServletRequest request) {
        List<RecipeDto> recipes = recipeService.findRecipesByUserId(userId);
        return ResponseEntity.ok(recipes);
    }

}
