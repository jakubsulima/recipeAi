package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.FridgeIngredientMapper;
import org.jakub.backendapi.repositories.FridgeIngredientRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
                .unit(null)
                .amount(1.0)
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
                .unit(null)
                .amount(1.0) // Default amount for testing
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
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder().name("Milk").amount(1.0).build();
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

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenInvalidUnitProvided() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder()
                .name("Milk")
                .unit("INVALID_UNIT")
                .amount(1.0)
                .build();

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Invalid unit value provided: INVALID_UNIT", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenAmountIsZeroOrNegative() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder()
                .name("Milk")
                .unit("LITERS")
                .amount(0)
                .build();

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Amount must be positive", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
    }

    @Test
    void addFridgeIngredient_shouldAddIngredient_whenValidDataProvided() {
        // Given
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);

        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder()
                .name("Milk")
                .unit("LITERS")
                .amount(1.0)
                .expirationDate(LocalDate.now().plusDays(7))
                .build();

        FridgeIngredient fridgeIngredient = new FridgeIngredient();
        fridgeIngredient.setName(fridgeIngredientDto.getName());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(fridgeIngredientMapper.toFridgeIngredientWithUser(any(FridgeIngredientDto.class), any(User.class))).thenReturn(fridgeIngredient);
        when(fridgeIngredientRepository.save(any(FridgeIngredient.class))).thenReturn(fridgeIngredient);

        // When
        FridgeIngredient result = fridgeService.addFridgeIngredient(fridgeIngredientDto, email);

        // Then
        assertNotNull(result);
        assertEquals("Milk", result.getName());
        verify(fridgeIngredientRepository).save(fridgeIngredient);
    }


}
