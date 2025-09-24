package org.jakub.backendapi.services;

import jakarta.transaction.Transactional;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.entities.Enums.Role;
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

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeMapper recipeMapper;

    public RecipeService(RecipeRepository recipeRepository, UserRepository userRepository, IngredientRepository ingredientRepository, RecipeIngredientRepository recipeIngredientRepository, RecipeMapper recipeMapper) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.recipeMapper = recipeMapper;
    }

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

        List<RecipeIngredient> recipeIngredients = recipeDto.getIngredients().stream()
                .map(dto -> {
                    Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                            .orElseGet(() -> ingredientRepository.save(new Ingredient(null, dto.getName(), new ArrayList<>())));

                    RecipeIngredient recipeIngredient = new RecipeIngredient();
                    recipeIngredient.setRecipe(recipe);
                    recipeIngredient.setIngredient(ingredient);
                    recipeIngredient.setAmount(dto.getAmount());
                    recipeIngredient.setUnit(dto.getUnit());
                    return recipeIngredient;
                })
                .collect(Collectors.toCollection(ArrayList::new));

        recipe.setRecipeIngredients(recipeIngredients);
        return recipeRepository.save(recipe);
    }

    public List<RecipeDto> findRecipesByUserId(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));
        ArrayList<Recipe> recipes = user.getRecipes().isEmpty() ? new ArrayList<>() : new ArrayList<>(user.getRecipes());
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
        if (!Objects.equals(recipe.getUser().getEmail(), login)) {
            throw new AppException("You are not the owner of this recipe", HttpStatus.FORBIDDEN);
        }
        recipeRepository.delete(recipe);
        return recipeMapper.toResponseDto("Recipe deleted successfully", recipe);
    }

    public RecipeDto updateRecipe(Long id, RecipeDto recipeDto, String login) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));
        if (!Objects.equals(recipe.getUser().getEmail(), login)) {
            User user = userRepository.findByEmail(login)
                    .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
            if (user.getRole() != Role.ADMIN) {
                throw new AppException("You are not the owner of this recipe or an admin", HttpStatus.FORBIDDEN);
            }
        }

        return getRecipeDto(recipeDto, recipe);
    }

    private RecipeDto getRecipeDto(RecipeDto recipeDto, Recipe recipe) {
        if (recipeDto.getIngredients() == null || recipeDto.getIngredients().isEmpty()) {
            throw new AppException("Recipe must have at least one ingredient", HttpStatus.BAD_REQUEST);
        }

        recipe.setName(recipeDto.getName());
        recipe.setDescription(recipeDto.getDescription());

        List<RecipeIngredient> updatedIngredients = recipeDto.getIngredients().stream()
                .map(dto -> {
                    Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(dto.getName())
                            .orElseGet(() -> ingredientRepository.save(new Ingredient(null, dto.getName(), new ArrayList<>())));

                    RecipeIngredient recipeIngredient = new RecipeIngredient();
                    recipeIngredient.setRecipe(recipe);
                    recipeIngredient.setIngredient(ingredient);
                    recipeIngredient.setAmount(dto.getAmount());
                    recipeIngredient.setUnit(dto.getUnit());
                    return recipeIngredient;
                })
                .collect(Collectors.toList());

        recipeIngredientRepository.deleteAll(recipe.getRecipeIngredients());
        recipe.setRecipeIngredients(updatedIngredients);
        recipeIngredientRepository.saveAll(updatedIngredients);

        return recipeMapper.toRecipeDto(recipeRepository.save(recipe));
    }

    public RecipeDto adminUpdateRecipe(Long id, RecipeDto recipeDto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));

        return getRecipeDto(recipeDto, recipe);
    }

    public RecipeResponseDto adminDeleteRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new AppException("Recipe not found", HttpStatus.NOT_FOUND));
        recipeRepository.delete(recipe);
        return recipeMapper.toResponseDto("Recipe deleted successfully by admin", recipe);
    }
}
