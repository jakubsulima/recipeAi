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
import java.util.*;

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
                .category("FRIDGE")
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
        FridgeIngredientDto fridgeIngredientDto = FridgeIngredientDto.builder().name("Milk").amount(1.0).category("FRIDGE   ").build();
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
                .category("FRIDGE")
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
                .category("FRIDGE")
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

    @Test
    void getFridgeIngredientGroupedByCategory_shouldGroupByCategory() {
        String email = "test@example.com";
        UserDto userDto = UserDto.builder().id(1L).email(email).build();
        FridgeIngredient fi1 = FridgeIngredient.builder().id(1L).name("Milk").build();
        FridgeIngredient fi2 = FridgeIngredient.builder().id(2L).name("Peas").build();
        FridgeIngredient fi3 = FridgeIngredient.builder().id(3L).name("Cheese").build();

        FridgeIngredientDto d1 = FridgeIngredientDto.builder().id(1L).name("Milk").category("FRIDGE").build();
        FridgeIngredientDto d2 = FridgeIngredientDto.builder().id(2L).name("Peas").category("FREEZER").build();
        FridgeIngredientDto d3 = FridgeIngredientDto.builder().id(3L).name("Cheese").category("FRIDGE").build();

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findByUser_Id(userDto.getId())).thenReturn(Arrays.asList(fi1, fi2, fi3));
        when(fridgeIngredientMapper.toFridgeIngredientDto(fi1)).thenReturn(d1);
        when(fridgeIngredientMapper.toFridgeIngredientDto(fi2)).thenReturn(d2);
        when(fridgeIngredientMapper.toFridgeIngredientDto(fi3)).thenReturn(d3);

        Map<String, List<FridgeIngredientDto>> result = fridgeService.getFridgeIngredientGroupedByCategory(email);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(2, result.get("FRIDGE").size());
        assertEquals(1, result.get("FREEZER").size());
    }

    @Test
    void getFridgeIngredientGroupedByCategory_shouldReturnEmptyMap_whenNoIngredients() {
        String email = "empty@example.com";
        UserDto userDto = UserDto.builder().id(10L).email(email).build();
        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findByUser_Id(userDto.getId())).thenReturn(Collections.emptyList());

        Map<String, List<FridgeIngredientDto>> result = fridgeService.getFridgeIngredientGroupedByCategory(email);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenCategoryMissing() {
        String email = "test@example.com";
        FridgeIngredientDto dto = FridgeIngredientDto.builder()
                .name("Milk")
                .unit("LITERS")
                .amount(1.0)
                .build();

        AppException ex = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(dto, email));
        assertEquals("Category is required", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenInvalidCategoryProvided() {
        String email = "test@example.com";
        FridgeIngredientDto dto = FridgeIngredientDto.builder()
                .name("Milk")
                .category("INVALID_CATEGORY")
                .unit("LITERS")
                .amount(1.0)
                .build();

        AppException ex = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(dto, email));
        assertEquals("Invalid category value provided: INVALID_CATEGORY", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getCode());
    }

    @Test
    void addFridgeIngredient_shouldAcceptCaseInsensitiveUnitAndCategory() {
        String email = "test@example.com";
        User user = User.builder().id(5L).email(email).build();
        FridgeIngredientDto dto = FridgeIngredientDto.builder()
                .name("Juice")
                .category("fridge")
                .unit("liters")
                .amount(2.0)
                .expirationDate(LocalDate.now().plusDays(3))
                .build();

        FridgeIngredient mapped = FridgeIngredient.builder().name("Juice").user(user).build();
        FridgeIngredient saved = FridgeIngredient.builder().id(100L).name("Juice").user(user).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(fridgeIngredientMapper.toFridgeIngredientWithUser(dto, user)).thenReturn(mapped);
        when(fridgeIngredientRepository.save(mapped)).thenReturn(saved);

        FridgeIngredient result = fridgeService.addFridgeIngredient(dto, email);
        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(fridgeIngredientRepository).save(mapped);
    }

    @Test
    void deleteFridgeIngredient_shouldDelete_whenUserOwnsIngredient() {
        String email = "test@example.com";
        Long id = 1L;
        UserDto userDto = UserDto.builder().id(1L).email(email).build();
        User owner = User.builder().id(1L).email(email).build();
        FridgeIngredient fi = FridgeIngredient.builder().id(id).name("Milk").user(owner).build();

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findById(id)).thenReturn(Optional.of(fi));

        fridgeService.deleteFridgeIngredient(id, email);

        verify(fridgeIngredientRepository).deleteById(id);
        verify(fridgeIngredientMapper).toFridgeIngredientDto(fi);
    }

    @Test
    void deleteFridgeIngredient_shouldThrowForbidden_whenUserDoesNotOwnIngredient() {
        String email = "test@example.com";
        Long id = 2L;
        UserDto userDto = UserDto.builder().id(1L).email(email).build();
        User other = User.builder().id(99L).email("other@example.com").build();
        FridgeIngredient fi = FridgeIngredient.builder().id(id).name("Milk").user(other).build();

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findById(id)).thenReturn(Optional.of(fi));

        AppException ex = assertThrows(AppException.class, () -> fridgeService.deleteFridgeIngredient(id, email));
        assertEquals("You do not have permission to delete this fridge ingredient", ex.getMessage());
        assertEquals(HttpStatus.FORBIDDEN, ex.getCode());
    }
}
