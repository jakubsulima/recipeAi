package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FridgeIngredientMapper {
    FridgeIngredientDto toFridgeIngredientDto(FridgeIngredient fridgeIngredient);
    FridgeIngredient toFridgeIngredient(FridgeIngredientDto fridgeIngredientDto);
}
