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
        recipeService.saveRecipe(recipeDto, getLoginFromToken(request));
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
        RecipeResponseDto recipeResponseDto = recipeService.deleteRecipe(id, getLoginFromToken(request));
        return ResponseEntity.ok(recipeResponseDto);
    }

    @GetMapping("/getUserRecipes")
    public ResponseEntity<List<RecipeDto>> getUserRecipes(@PathVariable long userId, HttpServletRequest request) {
        List<RecipeDto> recipes = recipeService.findRecipesByUserId(userId);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/updateRecipe/{id}")
    public ResponseEntity<RecipeDto> updateRecipe(@PathVariable Long id, @RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        RecipeDto updatedRecipe = recipeService.updateRecipe(id, recipeDto, getLoginFromToken(request));
        return ResponseEntity.ok(updatedRecipe);
    }

    private String getLoginFromToken(HttpServletRequest request) {
        String token = JwtUtils.getTokenFromCookies(request, "access_token");
        return JwtUtils.getLoginFromToken(token);
    }



}
