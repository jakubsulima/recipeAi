package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.Enums.Diet;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.entities.UserPreferences;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.UserPreferencesMapper;
import org.jakub.backendapi.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserPreferencesServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPreferencesMapper preferencesMapper;

    @InjectMocks
    private UserPreferencesService userPreferencesService;

    private User user;
    private UserPreferences userPreferences;
    private UserPreferencesDto userPreferencesDto;
    private String userEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail(userEmail);

        userPreferences = new UserPreferences();
        userPreferences.setId(1L);
        userPreferences.setUser(user);
        userPreferences.setDiet(Diet.VEGETARIAN);
        userPreferences.setDislikedIngredients(new ArrayList<>(Collections.singletonList("Onion")));
        user.setUserPreferences(userPreferences);

        userPreferencesDto = new UserPreferencesDto();
        userPreferencesDto.setDiet("VEGAN");
        userPreferencesDto.setDislikedIngredients(Collections.singletonList("Onion").toArray(new String[0]));
    }

    @Test
    void getPreferences_shouldReturnUserPreferences_whenUserExists() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(userPreferences)).thenReturn(userPreferencesDto);

        UserPreferencesDto result = userPreferencesService.getPreferences(userEmail);

        assertNotNull(result);
        assertEquals(userPreferencesDto, result);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(preferencesMapper, times(1)).toUserPreferencesDto(userPreferences);
    }

    @Test
    void getPreferences_shouldThrowAppException_whenUserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.getPreferences(userEmail);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void changeDiet_shouldUpdateDiet_whenDataIsValid() {
        String newDiet = "VEGAN";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(userPreferencesDto);

        userPreferencesService.changeDiet(userEmail, newDiet);

        assertEquals(Diet.VEGAN, user.getUserPreferences().getDiet());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void changeDiet_shouldThrowAppException_whenUserNotFound() {
        String newDiet = "VEGAN";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.changeDiet(userEmail, newDiet);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void changeDiet_shouldThrowAppException_whenDietIsInvalid() {
        String invalidDiet = "INVALID_DIET";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.changeDiet(userEmail, invalidDiet);
        });

        assertEquals("Invalid diet value", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void addDislikedIngredient_shouldAddIngredient_whenIngredientIsNew() {
        String newIngredient = "Tomato";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(userPreferencesDto);

        userPreferencesService.addDislikedIngredient(userEmail, newIngredient);

        assertTrue(user.getUserPreferences().getDislikedIngredients().contains(newIngredient));
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void addDislikedIngredient_shouldThrowAppException_whenUserNotFound() {
        String newIngredient = "Tomato";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.addDislikedIngredient(userEmail, newIngredient);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void removeDislikedIngredient_shouldRemoveIngredient_whenIngredientExists() {
        String ingredientToRemove = "Onion";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(userPreferencesDto);

        userPreferencesService.removeDislikedIngredient(userEmail, ingredientToRemove);

        assertFalse(user.getUserPreferences().getDislikedIngredients().contains(ingredientToRemove));
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void removeDislikedIngredient_shouldThrowAppException_whenUserNotFound() {
        String ingredientToRemove = "Onion";
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.removeDislikedIngredient(userEmail, ingredientToRemove);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void getDiets_shouldReturnAllDiets() {
        Diet[] diets = userPreferencesService.getDiets();
        assertArrayEquals(Diet.values(), diets);
    }
}
