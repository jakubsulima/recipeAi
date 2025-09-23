package org.jakub.backendapi.services;

import jakarta.transaction.Transactional;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.Enums.CategoryFridgeIngredient;
import org.jakub.backendapi.entities.Enums.Unit;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.FridgeIngredientMapper;
import org.jakub.backendapi.repositories.FridgeIngredientRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FridgeService {

    private final FridgeIngredientRepository fridgeIngredientRepository;
    private final UserRepository userRepository;
    private final FridgeIngredientMapper fridgeIngredientMapper;
    private final UserService userService;

    public FridgeService(FridgeIngredientRepository fridgeIngredientRepository, UserRepository userRepository, FridgeIngredientMapper fridgeIngredientMapper, UserService userService) {
        this.fridgeIngredientRepository = fridgeIngredientRepository;
        this.userRepository = userRepository;
        this.fridgeIngredientMapper = fridgeIngredientMapper;
        this.userService = userService;
    }

    public List<FridgeIngredientDto> getFridgeIngredients(String email) {
        UserDto userDto = userService.findByEmail(email);
        return fridgeIngredientRepository.findByUser_Id(userDto.getId()).stream().map(fridgeIngredientMapper::toFridgeIngredientDto).collect(Collectors.toList());
    }

    public Map<String, List<FridgeIngredientDto>> getFridgeIngredientGroupedByCategory(String email) {
        List<FridgeIngredientDto> fridgeIngredients = getFridgeIngredients(email);
        return fridgeIngredients.stream().collect(Collectors.groupingBy(FridgeIngredientDto::getCategory));
    }

    @Transactional
    public FridgeIngredient addFridgeIngredient(FridgeIngredientDto fridgeIngredientDto, String email) {
        System.out.println("Adding fridge ingredient: " + fridgeIngredientDto);
        if (fridgeIngredientDto.getUnit() != null) {
            validateUnit(fridgeIngredientDto.getUnit());
        } else {
            throw new AppException("Unit is required", HttpStatus.BAD_REQUEST);
        }

        if (fridgeIngredientDto.getCategory() != null) {
            validateCategory(fridgeIngredientDto.getCategory());
        } else {
            throw new AppException("Category is required", HttpStatus.BAD_REQUEST);
        }

        if (fridgeIngredientDto.getAmount() <= 0) {
            throw new AppException("Amount must be positive", HttpStatus.BAD_REQUEST);
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        FridgeIngredient fridgeIngredient = fridgeIngredientMapper.toFridgeIngredientWithUser(fridgeIngredientDto, user);
        return fridgeIngredientRepository.save(fridgeIngredient);
    }

    public void deleteFridgeIngredient(Long id, String email) {
        UserDto userDto = userService.findByEmail(email);
        FridgeIngredient fridgeIngredient = fridgeIngredientRepository.findById(id).orElseThrow(() -> new AppException("Fridge ingredient not found", HttpStatus.NOT_FOUND));

        if (!fridgeIngredient.getUser().getId().equals(userDto.getId())) {
            throw new AppException("You do not have permission to delete this fridge ingredient", HttpStatus.FORBIDDEN);
        }
        fridgeIngredientRepository.deleteById(id);

        fridgeIngredientMapper.toFridgeIngredientDto(fridgeIngredient);
    }

    private void validateUnit(String unit) {
        try {
            Unit.valueOf(unit.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid unit value provided: " + unit, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateCategory(String category) {
        try {
            CategoryFridgeIngredient.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid category value provided: " + category, HttpStatus.BAD_REQUEST);
        }
    }

}
