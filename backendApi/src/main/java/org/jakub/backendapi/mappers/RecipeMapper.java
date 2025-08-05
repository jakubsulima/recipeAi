package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeIngredientDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.RecipeIngredient;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RecipeMapper {
    @Mapping(target = "ingredients", source = "recipeIngredients")
    RecipeDto toRecipeDto(Recipe recipe);

    RecipeResponseDto toResponseDto(String message, Recipe recipe);

    Recipe toRecipe(RecipeDto recipeDto);

    @Mapping(source = "ingredient.name", target = "name")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "unit", target = "unit")
    RecipeIngredientDto recipeIngredientToRecipeIngredientDto(RecipeIngredient recipeIngredient);

    default Recipe toRecipeWithUser(RecipeDto recipeDto, User user) {
        Recipe recipe = toRecipe(recipeDto);
        recipe.setUser(user);
        return recipe;
    }
}
