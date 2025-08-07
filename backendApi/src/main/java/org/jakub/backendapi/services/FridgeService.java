package org.jakub.backendapi.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.dto.UserDto;
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
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class FridgeService {
    private final FridgeIngredientRepository fridgeIngredientRepository;
    private final UserService userService;
    private final FridgeIngredientMapper fridgeIngredientMapper;
    private final UserRepository userRepository;

    public List<FridgeIngredientDto> getFridgeIngredients(String email) {
        UserDto userDto = userService.findByEmail(email);
        return fridgeIngredientRepository.findByUser_Id(userDto.getId()).stream().map(fridgeIngredientMapper::toFridgeIngredientDto).collect(Collectors.toList());
    }

    @Transactional
    public FridgeIngredient addFridgeIngredient(FridgeIngredientDto fridgeIngredientDto, String email) {
        if (fridgeIngredientDto.getUnit() != null) {
            try {
                System.out.println(Unit.valueOfAbbreviation(fridgeIngredientDto.getUnit()).name());
                Unit.valueOf(Unit.valueOfAbbreviation(fridgeIngredientDto.getUnit()).name());
            } catch (IllegalArgumentException e) {
                throw new AppException("Invalid unit value provided: " + fridgeIngredientDto.getUnit(), HttpStatus.BAD_REQUEST);
            }
        }
        if (fridgeIngredientDto.getAmount() <= 0) {
            throw new AppException("Amount must be positive", HttpStatus.BAD_REQUEST);
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        FridgeIngredient fridgeIngredient = fridgeIngredientMapper.toFridgeIngredientWithUser(fridgeIngredientDto, user);
        return fridgeIngredientRepository.save(fridgeIngredient);
    }

    public FridgeIngredientDto deleteFridgeIngredient(Long id, String email) {
        UserDto userDto = userService.findByEmail(email);
        FridgeIngredient fridgeIngredient = fridgeIngredientRepository.findById(id).orElseThrow(() -> new AppException("Fridge ingredient not found", HttpStatus.NOT_FOUND));

        if (!fridgeIngredient.getUser().getId().equals(userDto.getId())) {
            throw new AppException("You do not have permission to delete this fridge ingredient", HttpStatus.FORBIDDEN);
        }
        fridgeIngredientRepository.deleteById(id);

        return fridgeIngredientMapper.toFridgeIngredientDto(fridgeIngredient);
    }

}
