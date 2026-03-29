package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.services.GeminiService;
import org.jakub.backendapi.services.RateLimitService;
import org.jakub.backendapi.services.RecipeService;
import org.jakub.backendapi.services.UserPreferencesService;
import org.jakub.backendapi.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
public class RecipesController {
    private static final int GENERATE_RECIPE_LIMIT_PER_MINUTE = 15;

    private final RecipeService recipeService;
    private final UserService userService;
    private final UserPreferencesService userPreferencesService;
    private final GeminiService geminiService;
    private final RateLimitService rateLimitService;

    @Value("${security.trusted-proxy-ips:}")
    private String trustedProxyIps;

    public RecipesController(RecipeService recipeService, UserService userService, UserPreferencesService userPreferencesService, GeminiService geminiService, RateLimitService rateLimitService) {
        this.recipeService = recipeService;
        this.userService = userService;
        this.userPreferencesService = userPreferencesService;
        this.geminiService = geminiService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/addRecipe")
    public ResponseEntity<RecipeDto> addRecipe(@RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        recipeService.saveRecipe(recipeDto, getAuthenticatedUserEmail());
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
        RecipeResponseDto recipeResponseDto = recipeService.deleteRecipe(id, getAuthenticatedUserEmail());
        return ResponseEntity.ok(recipeResponseDto);
    }

    @GetMapping("/getUserRecipes/{userId}")
    public ResponseEntity<Page<RecipeDto>> getUserRecipes(@PathVariable long userId, Pageable p) {
        Page<RecipeDto> recipes = recipeService.findRecipesByUserId(userId, p);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/updateRecipe/{id}")
    public ResponseEntity<RecipeDto> updateRecipe(@PathVariable Long id, @RequestBody RecipeDto recipeDto, HttpServletRequest request) {
        RecipeDto updatedRecipe = recipeService.updateRecipe(id, recipeDto, getAuthenticatedUserEmail());
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

        String clientKey = resolveClientKey(request);
        rateLimitService.assertAllowed(
            "generateRecipe:" + clientKey,
            GENERATE_RECIPE_LIMIT_PER_MINUTE,
            60_000L,
            "Too many recipe generation requests. Please try again in a minute."
        );

        try {
            String userEmail = getAuthenticatedUserEmail();
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

    private String resolveClientKey(HttpServletRequest request) {
        String userEmail = getAuthenticatedUserEmail();
        if (StringUtils.hasText(userEmail)) {
            return userEmail;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor) && isFromTrustedProxy(request.getRemoteAddr())) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDto userDto) {
            return userDto.getEmail();
        }

        return null;
    }

    private boolean isFromTrustedProxy(String remoteAddr) {
        Set<String> trusted = Arrays.stream(trustedProxyIps.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toSet());

        return trusted.contains(remoteAddr);
    }
}