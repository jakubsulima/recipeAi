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
        userPreferences.setDislikedIngredients(Collections.singletonList("Onion"));
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
    void patchPreferences_shouldUpdatePreferences_whenDataIsValid() {
        UserPreferencesDto newPreferencesDto = new UserPreferencesDto();
        newPreferencesDto.setDiet("VEGETARIAN");
        newPreferencesDto.setDislikedIngredients(Collections.singletonList("Garlic").toArray(new String[0]));

        UserPreferences updatedUserPreferences = new UserPreferences();
        updatedUserPreferences.setDislikedIngredients(Collections.singletonList("Garlic"));

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(newPreferencesDto);

        UserPreferencesDto result = userPreferencesService.patchPreferences(userEmail, newPreferencesDto);

        assertNotNull(result);
        assertEquals(newPreferencesDto, result);
        assertEquals(Diet.VEGETARIAN, user.getUserPreferences().getDiet());
        assertEquals(java.util.List.of("Garlic", "Onion"), user.getUserPreferences().getDislikedIngredients());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void patchPreferences_shouldThrowAppException_whenUserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.patchPreferences(userEmail, userPreferencesDto);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void patchPreferences_shouldThrowAppException_whenDietIsInvalid() {
        UserPreferencesDto invalidDietDto = new UserPreferencesDto();
        invalidDietDto.setDiet("INVALID_DIET");

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));

        AppException exception = assertThrows(AppException.class, () -> {
            userPreferencesService.patchPreferences(userEmail, invalidDietDto);
        });

        assertEquals("Invalid diet value", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
        verify(userRepository, times(1)).findByEmail(userEmail);
    }

    @Test
    void patchPreferences_shouldUpdateOnlyDiet_whenDislikedIngredientsAreNull() {
        UserPreferencesDto newPreferencesDto = new UserPreferencesDto();
        newPreferencesDto.setDiet("VEGETARIAN");

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(newPreferencesDto);

        UserPreferencesDto result = userPreferencesService.patchPreferences(userEmail, newPreferencesDto);

        assertNotNull(result);
        assertEquals(Diet.VEGETARIAN, user.getUserPreferences().getDiet());
        assertEquals(Collections.singletonList("Onion"), user.getUserPreferences().getDislikedIngredients());
    }

    @Test
    void patchPreferences_shouldUpdateOnlyDislikedIngredients_whenDietIsNull() {
        UserPreferencesDto newPreferencesDto = new UserPreferencesDto();
        newPreferencesDto.setDislikedIngredients(Collections.singletonList("Tomato").toArray(new String[0]));

        UserPreferences updatedUserPreferences = new UserPreferences();
        updatedUserPreferences.setDislikedIngredients(Collections.singletonList("Tomato"));

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(preferencesMapper.toUserPreferencesDto(user.getUserPreferences())).thenReturn(newPreferencesDto);

        UserPreferencesDto result = userPreferencesService.patchPreferences(userEmail, newPreferencesDto);

        assertNotNull(result);
        assertEquals(Diet.VEGETARIAN, user.getUserPreferences().getDiet());
        assertEquals(java.util.List.of("Tomato", "Onion"), user.getUserPreferences().getDislikedIngredients());
    }
}
