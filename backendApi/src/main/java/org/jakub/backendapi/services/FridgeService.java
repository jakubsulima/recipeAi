package org.jakub.backendapi.services;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.mappers.FridgeIngredientMapper;
import org.jakub.backendapi.repositories.FridgeIngredientRepository;
import org.jakub.backendapi.repositories.UserRepository;
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
        return fridgeIngredientRepository.findByUser_Id(userDto.getId())
                .stream()
                .map(fridgeIngredientMapper::toFridgeIngredientDto)
                .collect(Collectors.toList());
    }

    public FridgeIngredient addFridgeIngredient(FridgeIngredientDto fridgeIngredientDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FridgeIngredient fridgeIngredient = fridgeIngredientMapper.toFridgeIngredientWithUser(fridgeIngredientDto, user);
        return fridgeIngredientRepository.save(fridgeIngredient);
    }

    public void deleteFridgeIngredient(Long id) {
        fridgeIngredientRepository.deleteById(id);
    }

}
