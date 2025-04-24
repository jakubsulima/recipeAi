package org.jakub.backendapi.services;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeIngredientDto;
import org.jakub.backendapi.entities.Ingredient;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.RecipeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.RecipeIngredientMapper;
import org.jakub.backendapi.mappers.RecipeMapper;
import org.jakub.backendapi.repositories.IngredientRepository;
import org.jakub.backendapi.repositories.RecipeIngredientRepository;
import org.jakub.backendapi.repositories.RecipeRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeMapper recipeMapper;
    private final UserRepository userRepository;
    private final RecipeIngredientMapper recipeIngredientMapper;

    public RecipeDto getRecipe(Long id) {
        return recipeMapper.toRecipeDto(
            recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND))
        );
    }

    public List<RecipeDto> getAllRecipes() {
        return recipeRepository.findAll().stream()
                .map(recipeMapper::toRecipeDto)
                .toList();
    }

   public Recipe saveRecipe(RecipeDto recipeDto, String login) {
    User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

    // 1. Check if recipe already exists for this user
    recipeRepository.findByNameAndUser(recipeDto.getName(), user)
            .ifPresent(existing -> {
                throw new AppException("Recipe already exists", HttpStatus.CONFLICT);
            });

    // 2. Map basic recipe info (ingredients added later)
    Recipe recipe = recipeMapper.toRecipeWithUser(recipeDto, user);
    recipe = recipeRepository.save(recipe); // Save it first to get the ID (for FK in RecipeIngredient)

    // 3. Convert ingredients with Ingredient check
       Recipe finalRecipe = recipe;
       List<RecipeIngredient> recipeIngredients = recipeDto.getIngredients().stream()
            .map(dto -> {
                // Find or create Ingredient
                Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                        .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                                .name(dto.getName())
                                .build()));

                // Map to RecipeIngredient
                return RecipeIngredient.builder()
                        .recipe(finalRecipe)
                        .ingredient(ingredient)
                        .amount(dto.getAmount())
                        .unit(dto.getUnit())
                        .build();
            })
            .toList();

    // 4. Save ingredients and set them on the recipe
    recipeIngredientRepository.saveAll(recipeIngredients);
    recipe.setRecipeIngredients(recipeIngredients); // this assumes you have a `List<RecipeIngredient> ingredients` field in Recipe

    return recipeRepository.save(recipe); // Update with ingredients
}



    public List<Recipe> findRecipesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));

        return user.getRecipes();
    }
}

