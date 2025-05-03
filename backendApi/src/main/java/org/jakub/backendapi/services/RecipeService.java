package org.jakub.backendapi.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.entities.Ingredient;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.RecipeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.RecipeMapper;
import org.jakub.backendapi.repositories.IngredientRepository;
import org.jakub.backendapi.repositories.RecipeIngredientRepository;
import org.jakub.backendapi.repositories.RecipeRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeMapper recipeMapper;
    private final UserRepository userRepository;

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

   @Transactional
public Recipe saveRecipe(RecipeDto recipeDto, String login) {
    User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

    recipeRepository.findByNameAndUser(recipeDto.getName(), user)
            .ifPresent(existing -> {
                throw new AppException("Recipe '" + recipeDto.getName() + "' already exists for user '" + login + "'", HttpStatus.CONFLICT);
            });

    if (recipeDto.getIngredients() == null || recipeDto.getIngredients().isEmpty()) {
        throw new AppException("Recipe must have at least one ingredient", HttpStatus.BAD_REQUEST);
    }

    Recipe recipe = recipeMapper.toRecipeWithUser(recipeDto, user);
    recipe = recipeRepository.save(recipe); // save to get an ID

       Recipe finalRecipe = recipe;
       List<RecipeIngredient> recipeIngredients = recipeDto.getIngredients().stream()
            .map(dto -> {
                Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                        .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                                .name(dto.getName())
                                .build()));

                return RecipeIngredient.builder()
                        .recipe(finalRecipe)
                        .ingredient(ingredient)
                        .amount(dto.getAmount())
                        .unit(dto.getUnit())
                        .build();
            })
            .collect(Collectors.toCollection(ArrayList::new));

    recipeIngredientRepository.saveAll(recipeIngredients);
    recipe.setRecipeIngredients(recipeIngredients);
    return recipeRepository.save(recipe); // Save with ingredients
}




    public List<Recipe> findRecipesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));

        return user.getRecipes();
    }
}

