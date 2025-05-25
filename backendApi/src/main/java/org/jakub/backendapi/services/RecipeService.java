package org.jakub.backendapi.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
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
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeMapper recipeMapper;
    private final UserRepository userRepository;

    public RecipeDto getRecipeById(Long id) {
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
        User user = userRepository.findByEmail(login)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        recipeRepository.findByNameAndUser(recipeDto.getName(), user)
                .ifPresent(existing -> {
                    throw new AppException("Recipe '" + recipeDto.getName() + "' already exists for user '" + login + "'", HttpStatus.CONFLICT);
                });

        if (recipeDto.getIngredients() == null || recipeDto.getIngredients().isEmpty()) {
            throw new AppException("Recipe must have at least one ingredient", HttpStatus.BAD_REQUEST);
        }

        Recipe recipe = recipeMapper.toRecipeWithUser(recipeDto, user);
        recipeRepository.save(recipe); // Save recipe first to generate ID

           List<RecipeIngredient> recipeIngredients = recipeDto.getIngredients().stream()
                .map(dto -> {
                    Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                            .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                                    .name(dto.getName())
                                    .build()));

                    return RecipeIngredient.builder()
                            .recipe(recipe)
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

    public List<RecipeDto> findRecipesByUserId(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));
        ArrayList<Recipe> recipes = user.getRecipes().isEmpty() ? new ArrayList<>() : new ArrayList<>(user.getRecipes());
        if (recipes.isEmpty()) {
            throw new AppException("User has no recipes", HttpStatus.NOT_FOUND);
        }
        return recipes.stream()
                .map(recipeMapper::toRecipeDto)
                .collect(Collectors.toList());
    }

    public RecipeDto getRecipeByName(String name) {
        Recipe recipe = recipeRepository.findByName(name)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));
        return recipeMapper.toRecipeDto(recipe);
    }

    public RecipeResponseDto deleteRecipe(Long id, String login) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));
        if(!Objects.equals(recipe.getUser().getEmail(), login)) {
            throw new AppException("You are not the owner of this recipe", HttpStatus.FORBIDDEN);
        }
        recipeRepository.delete(recipe);
        return recipeMapper.toResponseDto("Recipe deleted successfully", recipe);
    }

    public RecipeDto updateRecipe(Long id, RecipeDto recipeDto, String login) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));
        if (!Objects.equals(recipe.getUser().getEmail(), login)) {
            throw new AppException("You are not the owner of this recipe", HttpStatus.FORBIDDEN);
        }

        if (recipeDto.getIngredients() == null || recipeDto.getIngredients().isEmpty()) {
            throw new AppException("Recipe must have at least one ingredient", HttpStatus.BAD_REQUEST);
        }

        recipe.setName(recipeDto.getName());
        recipe.setDescription(recipeDto.getDescription());

        List<RecipeIngredient> updatedIngredients = recipeDto.getIngredients().stream()
                .map(dto -> {
                    Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                            .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                                    .name(dto.getName())
                                    .build()));

                    return RecipeIngredient.builder()
                            .recipe(recipe)
                            .ingredient(ingredient)
                            .amount(dto.getAmount())
                            .unit(dto.getUnit())
                            .build();
                })
                .collect(Collectors.toList());

        recipeIngredientRepository.deleteAll(recipe.getRecipeIngredients());
        recipe.setRecipeIngredients(updatedIngredients);
        recipeIngredientRepository.saveAll(updatedIngredients);

        return recipeMapper.toRecipeDto(recipeRepository.save(recipe));
    }
}

