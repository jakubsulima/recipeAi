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
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto(null, "Tomato", expirationDate, "FRIDGE", 1.0, "PIECES");
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        FridgeIngredient mappedFridgeIngredient = new FridgeIngredient();
        mappedFridgeIngredient.setName("Tomato");
        mappedFridgeIngredient.setExpirationDate(expirationDate);
        mappedFridgeIngredient.setUser(user);

        FridgeIngredient savedFridgeIngredient = new FridgeIngredient();
        savedFridgeIngredient.setId(1L);
        savedFridgeIngredient.setName("Tomato");
        savedFridgeIngredient.setUnit("PIECES");
        savedFridgeIngredient.setAmount(1.0);
        savedFridgeIngredient.setExpirationDate(expirationDate);
        savedFridgeIngredient.setUser(user);

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
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto(null, "Milk", null, "FRIDGE", 1.0, "LITERS");
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
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto();
        fridgeIngredientDto.setName("Milk");
        fridgeIngredientDto.setUnit("INVALID_UNIT");
        fridgeIngredientDto.setAmount(1.0);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Invalid unit value provided: INVALID_UNIT", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenAmountIsZeroOrNegative() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto();
        fridgeIngredientDto.setName("Milk");
        fridgeIngredientDto.setUnit("LITERS");
        fridgeIngredientDto.setAmount(0);
        fridgeIngredientDto.setCategory("DAIRY");


        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Amount must be positive", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
    }

    @Test
    void addFridgeIngredient_shouldAddIngredient_whenValidDataProvided() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto();
        fridgeIngredientDto.setName("Milk");
        fridgeIngredientDto.setUnit("LITERS");
        fridgeIngredientDto.setAmount(1.0);
        fridgeIngredientDto.setCategory("DAIRY");

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        FridgeIngredient mappedIngredient = new FridgeIngredient(); // Simplified for clarity
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(fridgeIngredientMapper.toFridgeIngredientWithUser(fridgeIngredientDto, user)).thenReturn(mappedIngredient);
        when(fridgeIngredientRepository.save(mappedIngredient)).thenReturn(mappedIngredient);

        // When
        FridgeIngredient result = fridgeService.addFridgeIngredient(fridgeIngredientDto, email);

        // Then
        assertNotNull(result);
        assertEquals("Milk", result.getName());
        verify(fridgeIngredientRepository).save(mappedIngredient);
    }

    @Test
    void getFridgeIngredientGroupedByCategory_shouldReturnGroupedIngredients() {
        // Given
        String email = "test@example.com";
        UserDto userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail(email);

        FridgeIngredient ingredient1 = new FridgeIngredient();
        ingredient1.setId(1L);
        ingredient1.setName("Milk");
        ingredient1.setCategory(null);

        FridgeIngredient ingredient2 = new FridgeIngredient();
        ingredient2.setId(2L);
        ingredient2.setName("Cheese");
        ingredient2.setCategory(null);

        FridgeIngredientDto dto1 = new FridgeIngredientDto();
        dto1.setId(1L);
        dto1.setName("Milk");
        dto1.setCategory("DAIRY");

        FridgeIngredientDto dto2 = new FridgeIngredientDto();
        dto2.setId(2L);
        dto2.setName("Cheese");
        dto2.setCategory("DAIRY");

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findByUser_Id(userDto.getId())).thenReturn(Arrays.asList(ingredient1, ingredient2));
        when(fridgeIngredientMapper.toFridgeIngredientDto(ingredient1)).thenReturn(dto1);
        when(fridgeIngredientMapper.toFridgeIngredientDto(ingredient2)).thenReturn(dto2);

        // When
        Map<String, List<FridgeIngredientDto>> result = fridgeService.getFridgeIngredientGroupedByCategory(email);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.containsKey("DAIRY"));
        assertEquals(2, result.get("DAIRY").size());
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
    void addFridgeIngredient_shouldThrowAppException_whenUnitMissing() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto();
        fridgeIngredientDto.setName("Milk");
        fridgeIngredientDto.setUnit(null);
        fridgeIngredientDto.setAmount(1.0);
        fridgeIngredientDto.setCategory("DAIRY");

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Unit is required", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
    }

    @Test
    void addFridgeIngredient_shouldThrowAppException_whenCategoryMissing() {
        // Given
        String email = "test@example.com";
        FridgeIngredientDto fridgeIngredientDto = new FridgeIngredientDto();
        fridgeIngredientDto.setName("Milk");
        fridgeIngredientDto.setUnit("LITERS");
        fridgeIngredientDto.setAmount(1.0);
        fridgeIngredientDto.setCategory(null);


        // When & Then
        AppException exception = assertThrows(AppException.class, () -> fridgeService.addFridgeIngredient(fridgeIngredientDto, email));

        assertEquals("Category is required", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getCode());
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
        // Given
        String email = "test@example.com";
        Long fridgeIngredientId = 1L;
        UserDto userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail(email);

        User user = new User();
        user.setId(1L);

        FridgeIngredient fridgeIngredient = new FridgeIngredient();
        fridgeIngredient.setId(fridgeIngredientId);
        fridgeIngredient.setUser(user);

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findById(fridgeIngredientId)).thenReturn(Optional.of(fridgeIngredient));

        // When
        fridgeService.deleteFridgeIngredient(fridgeIngredientId, email);

        // Then
        verify(fridgeIngredientRepository).deleteById(fridgeIngredientId);
        verify(fridgeIngredientMapper).toFridgeIngredientDto(fridgeIngredient);
    }

    @Test
    void deleteFridgeIngredient_shouldThrowException_whenUserDoesNotOwnIngredient() {
        // Given
        String email = "test@example.com";
        Long fridgeIngredientId = 1L;
        UserDto userDto = new UserDto();
        userDto.setId(1L);

        User otherUser = new User();
        otherUser.setId(2L);

        FridgeIngredient fridgeIngredient = new FridgeIngredient();
        fridgeIngredient.setId(fridgeIngredientId);
        fridgeIngredient.setUser(otherUser);

        when(userService.findByEmail(email)).thenReturn(userDto);
        when(fridgeIngredientRepository.findById(fridgeIngredientId)).thenReturn(Optional.of(fridgeIngredient));

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> fridgeService.deleteFridgeIngredient(fridgeIngredientId, email));
        assertEquals("You do not have permission to delete this fridge ingredient", ex.getMessage());
        assertEquals(HttpStatus.FORBIDDEN, ex.getCode());
    }
}
