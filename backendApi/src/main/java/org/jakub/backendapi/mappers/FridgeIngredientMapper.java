package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping; // Added import

@Mapper(componentModel = "spring")
public interface FridgeIngredientMapper {
    FridgeIngredientDto toFridgeIngredientDto(FridgeIngredient fridgeIngredient);

    @Mapping(source = "expirationDate", target = "expirationDate") // Explicitly map expirationDate
    FridgeIngredient toFridgeIngredient(FridgeIngredientDto fridgeIngredientDto);

    default FridgeIngredient toFridgeIngredientWithUser(FridgeIngredientDto fridgeIngredientDto, User user) {
        FridgeIngredient fridgeIngredient = toFridgeIngredient(fridgeIngredientDto);
        fridgeIngredient.setUser(user); // Assuming you have a setUserId method in FridgeIngredient
        return fridgeIngredient;
    }
}
