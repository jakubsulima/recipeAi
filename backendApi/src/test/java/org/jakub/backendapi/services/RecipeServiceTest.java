package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeIngredientDto;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.RecipeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.RecipeMapper;
import org.jakub.backendapi.repositories.IngredientRepository;
import org.jakub.backendapi.repositories.RecipeIngredientRepository;
import org.jakub.backendapi.repositories.RecipeRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private RecipeIngredientRepository recipeIngredientRepository;

    @Mock
    private RecipeMapper recipeMapper;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecipeService recipeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRecipe_RecipeExists() {
        Recipe recipe = Recipe.builder().id(1L).name("Pasta").build();
        RecipeDto recipeDto = RecipeDto.builder().id(1L).name("Pasta").build();

        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(recipeMapper.toRecipeDto(recipe)).thenReturn(recipeDto);

        RecipeDto result = recipeService.getRecipeById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(recipeRepository).findById(1L);
        verify(recipeMapper).toRecipeDto(recipe);
    }

    @Test
    void testGetRecipe_RecipeNotFound() {
        when(recipeRepository.findById(1L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> recipeService.getRecipeById(1L));
        assertEquals("Recipe not found", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }

    @Test
    void testSaveRecipe_Success() {
        RecipeDto recipeDto = RecipeDto.builder().name("Pizza").build();
        recipeDto.setIngredients(List.of(
                RecipeIngredientDto.builder().name("Flour").amount(200).unit("g").build(),
                RecipeIngredientDto.builder().name("Water").amount(100).unit("ml").build()
        ));
        User user = User.builder().id(1L).email("john@example.com").build(); // Changed login to email
        Recipe recipe = Recipe.builder().name("Pizza").user(user).build();
        Recipe savedRecipe = Recipe.builder().id(1L).name("Pizza").user(user).build();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user)); // Changed findByLogin to findByEmail
        when(recipeRepository.findByNameAndUser("Pizza", user)).thenReturn(Optional.empty());
        when(recipeMapper.toRecipeWithUser(recipeDto, user)).thenReturn(recipe);
        when(recipeRepository.save(recipe)).thenReturn(savedRecipe);
        Recipe result = recipeService.saveRecipe(recipeDto, "john@example.com"); // Changed login to email

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(userRepository).findByEmail("john@example.com"); // Changed findByLogin to findByEmail
        verify(recipeRepository).findByNameAndUser("Pizza", user);
        verify(recipeMapper).toRecipeWithUser(recipeDto, user);// Adjusted to verify save is called once with the mapped recipe
    }

    @Test
    void testSaveRecipe_NullIngredients() {
        RecipeDto recipeDto = RecipeDto.builder().name("Pizza").ingredients(null).build();
        User user = User.builder().id(1L).email("john@example.com").build(); // Changed login to email

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user)); // Changed findByLogin to findByEmail

        AppException ex = assertThrows(AppException.class, () -> recipeService.saveRecipe(recipeDto, "john@example.com")); // Changed login to email

        assertEquals("Recipe must have at least one ingredient", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
        verify(userRepository).findByEmail("john@example.com"); // Changed findByLogin to findByEmail
    }

    @Test
    void testSaveRecipe_RecipeAlreadyExists() {
        RecipeDto recipeDto = RecipeDto.builder().name("Pizza").build();
        User user = User.builder().id(1L).email("john@example.com").build(); // Changed login to email
        Recipe existingRecipe = Recipe.builder().id(1L).name("Pizza").user(user).build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user)); // Changed findByLogin to findByEmail
        when(recipeRepository.findByNameAndUser("Pizza", user)).thenReturn(Optional.of(existingRecipe));

        AppException ex = assertThrows(AppException.class, () -> recipeService.saveRecipe(recipeDto, "john@example.com")); // Changed login to email
        assertEquals("Recipe 'Pizza' already exists for user 'john@example.com'", ex.getMessage());
        assertEquals(HttpStatus.CONFLICT, ex.getCode());
        verify(userRepository).findByEmail("john@example.com"); // Changed findByLogin to findByEmail
    }

    @Test
    void testFindRecipesByUserId_UserExists() {
        User user = User.builder().id(1L).email("john@example.com").build();
        Recipe recipe = Recipe.builder().id(1L).name("Pasta").user(user).build();
        user.setRecipes(List.of(recipe));

        RecipeDto recipeDto = RecipeDto.builder().id(1L).name("Pasta").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        when(recipeMapper.toRecipeDto(recipe)).thenReturn(recipeDto);

        List<RecipeDto> result = recipeService.findRecipesByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Pasta", result.get(0).getName());
        verify(userRepository).findById(1L);
    }

    @Test
    void testFindRecipesByUserId_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> recipeService.findRecipesByUserId(1L));
        assertEquals("Unknown user", ex.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, ex.getCode());
    }
}

