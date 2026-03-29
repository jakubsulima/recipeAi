package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.services.GeminiService;
import org.jakub.backendapi.services.RecipeService;
import org.jakub.backendapi.services.UserPreferencesService;
import org.jakub.backendapi.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;


@RestController
public class RecipesController {
    private final RecipeService recipeService;
    private final UserService userService;
    private final UserPreferencesService userPreferencesService;
    private final GeminiService geminiService;

    public RecipesController(RecipeService recipeService, UserService userService, UserPreferencesService userPreferencesService, GeminiService geminiService) {
        this.recipeService = recipeService;
        this.userService = userService;
        this.userPreferencesService = userPreferencesService;
        this.geminiService = geminiService;
    }

    @PostMapping("/addRecipe")
    public ResponseEntity<RecipeDto> addRecipe(@RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        recipeService.saveRecipe(recipeDto, getLoginFromToken(request));
        return ResponseEntity.ok(recipeDto);
    }

    @GetMapping("/getAllRecipes")
    public ResponseEntity<Page<RecipeDto>> getAllRecipes(Pageable p) {
        Page<RecipeDto> recipes = recipeService.getAllRecipes(p);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/searchRecipes/{searchTerm}")
    public ResponseEntity<Page<RecipeDto>> searchRecipes(@PathVariable String searchTerm, Pageable p) {
        Page<RecipeDto> recipes = recipeService.searchRecipes(searchTerm, p);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/getRecipe/{id}")
    public ResponseEntity<RecipeDto> getRecipe(@PathVariable Long id) {
        RecipeDto recipe = recipeService.getRecipeById(id);
        System.out.println("Fetched Recipe: " + recipe);
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/getRecipeByName/{name}")
    public ResponseEntity<RecipeDto> getRecipeByName(@PathVariable String name) {
        RecipeDto recipe = recipeService.getRecipeByName(name);
        return ResponseEntity.ok(recipe);
    }

    @DeleteMapping("/deleteRecipe/{id}")
    public ResponseEntity<RecipeResponseDto> deleteRecipe(@PathVariable Long id, HttpServletRequest request) {
        RecipeResponseDto recipeResponseDto = recipeService.deleteRecipe(id, getLoginFromToken(request));
        return ResponseEntity.ok(recipeResponseDto);
    }

    @GetMapping("/getUserRecipes/{userId}")
    public ResponseEntity<Page<RecipeDto>> getUserRecipes(@PathVariable long userId, Pageable p) {
        Page<RecipeDto> recipes = recipeService.findRecipesByUserId(userId, p);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/updateRecipe/{id}")
    public ResponseEntity<RecipeDto> updateRecipe(@PathVariable Long id, @RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        RecipeDto updatedRecipe = recipeService.updateRecipe(id, recipeDto, getLoginFromToken(request));
        return ResponseEntity.ok(updatedRecipe);
    }

    // Admin Recipe Endpoints
    @PutMapping("/admin/recipes/{id}")
    public ResponseEntity<RecipeDto> adminUpdateRecipe(@PathVariable Long id, @RequestBody RecipeDto recipeDto) {
        RecipeDto updatedRecipe = recipeService.adminUpdateRecipe(id, recipeDto);
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/admin/deleteRecipe/{id}")
    public ResponseEntity<RecipeResponseDto> adminDeleteRecipe(@PathVariable Long id) {
        RecipeResponseDto recipeResponseDto = recipeService.adminDeleteRecipe(id);
        return ResponseEntity.ok(recipeResponseDto);
    }

    public record GenerateRecipeRequest(String fullPrompt, String prompt) {
    }

    @PostMapping("/generateRecipe")
    public ResponseEntity<String> createRecipe(@RequestBody GenerateRecipeRequest recipeRequest, HttpServletRequest request) {
        String recipePrompt = recipeRequest != null && StringUtils.hasText(recipeRequest.fullPrompt())
                ? recipeRequest.fullPrompt()
            : (recipeRequest != null ? recipeRequest.prompt() : null);

        if (!StringUtils.hasText(recipePrompt)) {
            return ResponseEntity.badRequest().body("Missing prompt. Provide 'fullPrompt' in request body.");
        }

        try {
            String userEmail = getLoginFromToken(request);
            if (userEmail != null && !userEmail.isEmpty()) {
                UserDto user = userService.findByEmail(userEmail);
                if (user != null) {
                    UserPreferencesDto preferences = userPreferencesService.getPreferences(userEmail);
                    if (preferences != null) {
                        recipePrompt += "\n\nUser Preferences: " + preferences;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Could not retrieve user preferences: " + e.getMessage());
        }

        return ResponseEntity.ok(geminiService.generateRecipe(recipePrompt));
    }
}