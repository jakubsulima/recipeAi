package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.entities.User; // Added import
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.FridgeIngredientMapper;
import org.jakub.backendapi.repositories.FridgeIngredientRepository;
import org.jakub.backendapi.repositories.UserRepository; // Added import
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Optional; // Added import
import java.time.LocalDate; // Added import

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull; // Added import
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify; // Added import
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any; // Added import for ArgumentMatchers

@ExtendWith(MockitoExtension.class)
class FridgeServiceTest {

    @Mock
    private FridgeIngredientRepository fridgeIngredientRepository;

    @Mock
    private UserService userService;

    @Mock
    private FridgeIngredientMapper fridgeIngredientMapper;

    @Mock
    private UserRepository userRepository; // Added mock

    @InjectMocks
    private FridgeService fridgeService;

    @Test
    void getFridgeIngredients_shouldReturnFridgeIngredientsForUser() {
        // Given
        String email = "test@example.com";
        UserDto userDto = UserDto.builder().id(1L).email(email).build();
        FridgeIngredient fridgeIngredient = FridgeIngredient.builder().id(1L).name("Milk").build();
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder().id(1L).name("Milk").build();

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findByUser_Id(userDto.getId())).thenReturn(Collections.singletonList(fridgeIngredient));
        when(fridgeIngredientMapper.toFridgeIngredientDto(fridgeIngredient)).thenReturn(fridgeIngredientDto);

        // When
        List<FridgeIngredientDto> result = fridgeService.getFridgeIngredients(email);

        // Then
        assertEquals(1, result.size());
        assertEquals("Milk", result.get(0).getName());
    }

    @Test
    void getFridgeIngredients_shouldThrowAppException_whenUserNotFound() {
        // Given
        String email = "nonexistent@example.com";
        String expectedErrorMessage = "Error: User not found (HTTP 404)";

        // Mock userService.findByEmail to throw an AppException
        when(userService.findByEmail(email))
                .thenThrow(new AppException(expectedErrorMessage, HttpStatus.NOT_FOUND));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.getFridgeIngredients(email));

        assertEquals(expectedErrorMessage, exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
    }

    @Test
    void getFridgeIngredients_shouldReturnEmptyList_whenUserHasNoIngredients() {
        // Given
        String email = "test@example.com";
        UserDto userDto = UserDto.builder().id(1L).email(email).build();

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findByUser_Id(userDto.getId())).thenReturn(Collections.emptyList());

        // When
        List<FridgeIngredientDto> result = fridgeService.getFridgeIngredients(email);

        // Then
        assertEquals(0, result.size());
    }

    @Test
    void addFridgeIngredient_shouldAddIngredient_whenUserExists() {
        // Given
        String email = "test@example.com";
        // Using a fixed date consistent with your example for testing
        LocalDate expirationDate = LocalDate.of(2028, 12, 20);
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder()
                .name("Tomato")
                .expirationDate(expirationDate)
                .build();
        User user = User.builder().id(1L).email(email).build();

        FridgeIngredient mappedFridgeIngredient = FridgeIngredient.builder()
                .name("Tomato")
                .expirationDate(expirationDate)
                .user(user)
                .build();

        FridgeIngredient savedFridgeIngredient = FridgeIngredient.builder()
                .id(1L) // ID assigned after save
                .name("Tomato")
                .expirationDate(expirationDate)
                .user(user)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(fridgeIngredientMapper.toFridgeIngredientWithUser(fridgeIngredientDto, user)).thenReturn(mappedFridgeIngredient);
        when(fridgeIngredientRepository.save(mappedFridgeIngredient)).thenReturn(savedFridgeIngredient);

        // When
        FridgeIngredient result = fridgeService.addFridgeIngredient(fridgeIngredientDto, email);

        // Then
        assertNotNull(result);
        assertEquals(savedFridgeIngredient.getId(), result.getId());
        assertEquals(savedFridgeIngredient.getName(), result.getName());
        assertEquals(savedFridgeIngredient.getExpirationDate(), result.getExpirationDate()); // Verify expiration date
        assertEquals(savedFridgeIngredient.getUser(), result.getUser()); // Verify user is set

        verify(userRepository).findByEmail(email);
        verify(fridgeIngredientMapper).toFridgeIngredientWithUser(fridgeIngredientDto, user);
        verify(fridgeIngredientRepository).save(mappedFridgeIngredient);
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenUserNotFound() {
        // Given
        String email = "nonexistent@example.com";
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder().name("Milk").build();
        String expectedErrorMessage = "User not found";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            fridgeService.addFridgeIngredient(fridgeIngredientDto, email);
        });

        assertEquals(expectedErrorMessage, exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void deleteFridgeIngredient_shouldThrowException_whenFridgeIngredientNotFound() {
        // Given
        String email = "test@example.com";
        UserDto userDto = UserDto.builder().id(1L).email(email).build();
        Long fridgeIngredientId = 1L;

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findById(fridgeIngredientId)).thenReturn(java.util.Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> fridgeService.deleteFridgeIngredient(fridgeIngredientId, email));
        assertEquals("Fridge ingredient not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getCode());
    }
}
